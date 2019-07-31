import { ObjectID } from 'bson';
import { crc32 } from 'crc';
import { config } from '../../config';
import { RecordSource } from '../../models/RecordSource';
import { ChannelDocument, FillerControl } from '../../models/streaming/Channel';
import {
  Schedule,
  ScheduleDocument,
  SourceRefType,
} from '../../models/streaming/Schedule';
import {
  TranscodedSourceDocument,
  TranscodeStatus,
} from '../../models/TranscodedSource';
import { ManifestInput } from '../hls/manifest';
import { encodeSegmentRef } from '../hls/segment-ref';
import { schedulerLogger } from '../logging';
import {
  EMPTY_FILLER_MAX_DURATION,
  EMPTY_FILLER_OFFSET,
  EMPTY_FILLER_SEGMENT_DURATION,
} from './empty-filler';

const SCHEDULE_CACHE_EXPIRES = 1000 * 60 * 1;
const LIVE_DELAY_SEC = 30;
const MANIFEST_DURATION = 20;

interface ManifestRef {
  type: 'source' | 'empty';
  sourceId: string;
  offset: number;
  length: number;
  duration: number;
  discontiniuity: boolean;
}

const dateDiffSec = (big: Date, small: Date) =>
  (big.getTime() - small.getTime()) / 1000;

class ManifestList {
  private _manifest: ManifestRef[] = [];
  private _totalDurationCache = 0;

  get manifest() {
    return this._manifest;
  }

  get totalDuration() {
    return this._totalDurationCache;
  }

  loadFromSource(
    source: TranscodedSourceDocument,
    condition?: (
      itemDuration: number,
      loadedDuration: number,
      totalDuration: number,
      itemCreated?: number,
    ) => boolean,
    breakAtFalseCondition?: boolean,
  ) {
    let duration = 0;
    let isBegin = true;
    for (const item of source.manifest) {
      if (
        condition &&
        !condition(
          item[2],
          duration,
          this._totalDurationCache + duration,
          item[3],
        )
      ) {
        if (breakAtFalseCondition) {
          break;
        } else {
          continue;
        }
      }

      duration += item[2];
      this._manifest.push({
        type: 'source',
        sourceId: source.id,
        offset: item[0],
        length: item[1],
        duration: item[2],
        discontiniuity: isBegin,
      });

      isBegin = false;
    }

    this._totalDurationCache += duration;

    return duration;
  }

  loadFromList(list: ManifestList) {
    this._manifest.push(...list.manifest);
    this._totalDurationCache += list.totalDuration;
  }

  loadEmptyFiller(duration: number) {
    if (duration > EMPTY_FILLER_MAX_DURATION)
      throw new Error('requested duration is too long');
    if (duration < EMPTY_FILLER_SEGMENT_DURATION)
      return EMPTY_FILLER_SEGMENT_DURATION;

    const count = Math.floor(duration / EMPTY_FILLER_SEGMENT_DURATION);
    const actualDuration = EMPTY_FILLER_SEGMENT_DURATION * count;
    this._manifest.push({
      type: 'empty',
      sourceId: '',
      offset: 0,
      length: EMPTY_FILLER_OFFSET[count - 1],
      duration: actualDuration,
      discontiniuity: true,
    });
    this._totalDurationCache += actualDuration;

    return actualDuration;
  }

  select(skipDuration: number, maxDuration = MANIFEST_DURATION) {
    let duration = 0;
    let skips = 0;
    let selectedDuration = 0;

    const manifest: ManifestRef[] = [];

    for (const item of this._manifest) {
      duration += item.duration;

      if (duration >= skipDuration) {
        selectedDuration += item.duration;
        manifest.push(item);

        if (selectedDuration > maxDuration) break;
      } else {
        skips++;
      }
    }

    return { skips, manifest, duration: selectedDuration };
  }
}

export class ScheduleResolver {
  private scheduleCache: ScheduleDocument[] = [];
  private lastScheduleCacheUpdated = 0;
  private sequenceMap: Map<string, number> = new Map();

  constructor(private channel: ChannelDocument) {}

  async initialize() {
    await this.channel.populate('fillerSources').execPopulate();
  }

  private async fetchFutureSchedules() {
    const now = new Date();
    const schedules = await Schedule.find({
      endAt: {
        $gt: now,
      },
    })
      .populate('source')
      .limit(3)
      .exec();

    return schedules;
  }

  private async updateScheduleCache() {
    const futureSchedules = await this.fetchFutureSchedules();
    this.scheduleCache.push(
      ...futureSchedules.filter(schedule =>
        this.scheduleCache.every(cached => cached.id !== schedule.id),
      ),
    );

    const now = Date.now();
    const futureOrCurrentScheduleBegin = this.scheduleCache.findIndex(
      schedule => schedule.endAt.getTime() >= now - 1000 * 60,
    );

    if (futureOrCurrentScheduleBegin !== 0) {
      this.scheduleCache.splice(0, futureOrCurrentScheduleBegin);
      schedulerLogger.debug(
        futureOrCurrentScheduleBegin,
        'past schedules was removed from cache',
      );
    }
  }

  private getRecentSchedule() {
    const now = Date.now();
    const futureOrCurrentScheduleBegin = this.scheduleCache.findIndex(
      schedule => schedule.endAt.getTime() >= now,
    );

    if (futureOrCurrentScheduleBegin === -1)
      throw new Error('no current schedule');
    const current = this.scheduleCache[futureOrCurrentScheduleBegin];
    if (current.startAt.getTime() >= now)
      throw new Error('no current schedule');

    const next = this.scheduleCache[futureOrCurrentScheduleBegin + 1];

    return { current, next };
  }

  private createEmptyFiller(duration: number) {
    const manifestList = new ManifestList();

    for (let remain = duration; remain > 1; ) {
      remain -= manifestList.loadEmptyFiller(
        Math.min(remain, EMPTY_FILLER_MAX_DURATION),
      );
    }

    return manifestList;
  }

  private createFillerManifest(scheduleId: string, duration: number) {
    const manifestList = new ManifestList();

    if (this.channel.fillerSources.length === 0) {
      return this.createEmptyFiller(duration);
    }

    const scheduleCrc = crc32(scheduleId);
    const availableFillers = this.channel.fillerSources;

    const skips =
      this.channel.fillerControl === FillerControl.Sequential
        ? 0
        : Math.abs(scheduleCrc & 0xffff) % availableFillers.length;
    const step =
      this.channel.fillerControl === FillerControl.Sequential
        ? 1
        : Math.abs(scheduleCrc >> 16) % availableFillers.length;

    let remain = duration;

    for (
      let index = skips;
      remain > 0;
      index = (index + step) % availableFillers.length
    ) {
      const filler = availableFillers[index];
      if (filler.status !== TranscodeStatus.Success) continue;

      remain -= manifestList.loadFromSource(
        filler,
        (nextDuration, duration) => {
          return remain - duration - nextDuration > 5; // more than 5 seconds left
        },
        true,
      );

      if (remain < EMPTY_FILLER_MAX_DURATION) break;
    }

    manifestList.loadEmptyFiller(remain);

    return manifestList;
  }

  private async resolveRtmpInputs(id: ObjectID, startAt: Date, endAt: Date) {
    const record = await RecordSource.find({
      source: id,
      status: {
        $in: [TranscodeStatus.Running, TranscodeStatus.Success],
      },
      lastManifestAppend: {
        $gte: startAt,
      },
      createdAt: {
        $lte: endAt,
      },
    })
      .sort({
        lastManifestAppend: 1,
      })
      .exec();

    return record;
  }

  private filterRtmpManifest(startAt: Date, endAt: Date) {
    const startAtTime = startAt.getTime();
    const endAtTime = endAt.getTime();
    const maxDuration = (endAtTime - startAtTime) / 1000;
    return (
      nextDuration: number,
      _loaded: number,
      total: number,
      createdAt?: number,
    ) => {
      if (!createdAt) return false;
      return (
        createdAt > startAtTime &&
        createdAt < endAtTime &&
        total + nextDuration < maxDuration
      );
    };
  }

  private async createRtmpInputManifest(schedule: ScheduleDocument) {
    const { startAt, endAt } = schedule;
    const sources = schedule.source
      ? await this.resolveRtmpInputs(schedule.source._id, startAt, endAt)
      : [];
    const manifestList = new ManifestList();
    const scheduleDuration = dateDiffSec(endAt, startAt);

    if (sources.length === 0) {
      manifestList.loadFromList(
        this.createFillerManifest(schedule.id, scheduleDuration),
      );

      return manifestList;
    }

    for (let index = 0; index < sources.length; index++) {
      const source = sources[index];
      const sourceStartAt = new Date(
        source.createdAt!.getTime() - LIVE_DELAY_SEC * 1000,
      );

      // (source begin date) - (schedule start date)
      const durationBetweenStartAndSource = dateDiffSec(sourceStartAt, startAt);
      if (durationBetweenStartAndSource > 0) {
        const fillerDuration =
          durationBetweenStartAndSource - manifestList.totalDuration;
        if (fillerDuration > 1) {
          schedulerLogger.debug(
            `insert filler before source ${index}:${
              source.id
            }, duration: ${fillerDuration}`,
          );

          manifestList.loadFromList(
            this.createFillerManifest(schedule.id, fillerDuration),
          );
        }
      }

      manifestList.loadFromSource(
        source,
        this.filterRtmpManifest(startAt, endAt),
      );
    }

    const lastFillerDuration = scheduleDuration - manifestList.totalDuration;
    if (lastFillerDuration > 1) {
      schedulerLogger.debug(
        `insert filler after last source, duration: ${lastFillerDuration}`,
      );

      manifestList.loadFromList(
        this.createFillerManifest(schedule.id, lastFillerDuration),
      );
    }

    schedulerLogger.debug(
      `live schedule duration:`,
      manifestList.totalDuration,
    );

    return manifestList;
  }

  private createTranscodedManifest(schedule: ScheduleDocument) {
    const { startAt, endAt } = schedule;
    const manifestList = new ManifestList();

    const scheduleDuration = dateDiffSec(endAt, startAt);

    if (schedule.source) {
      const source = schedule.source as TranscodedSourceDocument;

      manifestList.loadFromSource(
        source,
        (nextDuration, _loaded, total) => {
          return total + nextDuration < scheduleDuration;
        },
        true,
      );
    }

    const remain = scheduleDuration - manifestList.totalDuration;
    if (remain > 0) {
      manifestList.loadFromList(this.createFillerManifest(schedule.id, remain));
    }

    return manifestList;
  }

  private async createManifestForSchedule(schedule: ScheduleDocument) {
    if (schedule.sourceType === SourceRefType.RtmpInput) {
      return await this.createRtmpInputManifest(schedule);
    } else if (schedule.sourceType === SourceRefType.TranscodedSource) {
      return this.createTranscodedManifest(schedule);
    } else {
      throw new Error('unknown source');
    }
  }

  private async createFutureManifest(
    schedule: ScheduleDocument,
    maxDuration = MANIFEST_DURATION,
  ) {
    const manifest = await this.createManifestForSchedule(schedule);
    const elapsed = dateDiffSec(new Date(), schedule.startAt);

    return manifest.select(elapsed, maxDuration);
  }

  private async resolveSequenceStart(currentSchedule: ScheduleDocument) {
    if (this.sequenceMap.has(currentSchedule.id)) {
      return this.sequenceMap.get(currentSchedule.id)!;
    }

    const previousSchedule = await Schedule.findOne({
      endAt: {
        $gte: new Date(currentSchedule.startAt.getTime() - 1000),
        $lte: currentSchedule.startAt,
      },
    })
      .populate('source')
      .exec();

    if (!previousSchedule) {
      this.sequenceMap.set(currentSchedule.id, 0);
      return 0;
    }

    if (this.sequenceMap.has(previousSchedule.id)) {
      const previousStart = this.sequenceMap.get(previousSchedule.id)!;
      const {
        manifest: previousManifest,
      } = await this.createManifestForSchedule(previousSchedule);

      schedulerLogger.debug(
        'sequence',
        previousStart,
        '->',
        previousStart + previousManifest.length,
      );

      this.sequenceMap.set(
        currentSchedule.id,
        previousStart + previousManifest.length,
      );

      return previousStart + previousManifest.length;
    } else {
      this.sequenceMap.set(currentSchedule.id, 0);
      return 0;
    }
  }

  private createUrl(ref: ManifestRef) {
    switch (ref.type) {
      case 'source':
        return `${config.appUrl}/api/ts/${ref.sourceId}/${encodeSegmentRef(
          ref.offset,
          ref.length,
        )}.ts`;
      case 'empty':
      default:
        return `${config.appUrl}/api/tsfill/${encodeSegmentRef(
          ref.offset,
          ref.length,
        )}.ts`;
    }
  }

  async createManifest(): Promise<ManifestInput> {
    const now = Date.now();
    if (now - this.lastScheduleCacheUpdated >= SCHEDULE_CACHE_EXPIRES)
      await this.updateScheduleCache();

    const { next, current } = this.getRecentSchedule();
    const seqStart = await this.resolveSequenceStart(current);

    const { skips, manifest, duration } = await this.createFutureManifest(
      current,
    );

    if (duration < MANIFEST_DURATION && next) {
      schedulerLogger.debug('manifest too short, use next schedule');
      const { manifest: nextManifest } = await this.createFutureManifest(
        next,
        MANIFEST_DURATION - duration,
      );
      manifest.push(...nextManifest);
    } else if (manifest.length === 0) {
      throw new Error('channel not running');
    }

    return {
      seqBegin: seqStart + skips,
      items: manifest.map(item => {
        return {
          duration: item.duration,
          url: this.createUrl(item),
          discontinuityBegin: item.discontiniuity,
        };
      }),
      endList: false,
    };
  }
}

const resolvers: Map<string, ScheduleResolver> = new Map();

export const createScheduleResolver = async (channel: ChannelDocument) => {
  if (resolvers.has(channel.id)) return resolvers.get(channel.id)!;

  const scheduler = new ScheduleResolver(channel);
  resolvers.set(channel.id, scheduler);

  await scheduler.initialize();

  return scheduler;
};
