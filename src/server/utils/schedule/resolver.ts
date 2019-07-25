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
  Manifest as ManifestSource,
  TranscodedSourceDocument,
  TranscodeStatus,
} from '../../models/TranscodedSource';
import { ManifestInput } from '../hls/manifest';
import { encodeSegmentRef } from '../hls/segment-ref';
import { schedulerLogger } from '../logging';

const SCHEDULE_CACHE_EXPIRES = 1000 * 60 * 1;
const LIVE_DELAY_SEC = 30;

interface ManifestRef {
  sourceId: string;
  offset: number;
  length: number;
  duration: number;
  discontiniuity: boolean;
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

  private createFillerManifest(scheduleId: string, duration: number) {
    if (this.channel.fillerSources.length === 0) return [];

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

    const manifestRef: ManifestRef[] = [];

    for (
      let remain = duration, index = skips;
      remain > 0;
      index = (index + step) % availableFillers.length
    ) {
      const filler = availableFillers[index];
      if (!filler.duration) continue;

      for (const [index, item] of filler.manifest.entries()) {
        manifestRef.push({
          sourceId: filler.id,
          offset: item[0],
          length: item[1],
          duration: item[2],
          discontiniuity: index === 0,
        });

        remain -= item[2];

        if (remain < 8) break;
      }
    }

    return manifestRef;
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
    return (item: ManifestSource) => {
      if (!item[3]) return false;
      return item[3] > startAtTime && item[3] < endAtTime;
    };
  }

  private async createRtmpInputManifest(schedule: ScheduleDocument) {
    const { startAt, endAt } = schedule;
    const sources = schedule.source
      ? await this.resolveRtmpInputs(schedule.source._id, startAt, endAt)
      : [];
    const manifestRef: ManifestRef[] = [];

    if (sources.length === 0) {
      const fillerDuration = (endAt.getTime() - startAt.getTime()) / 1000;
      manifestRef.push(
        ...this.createFillerManifest(schedule.id, fillerDuration),
      );

      return manifestRef;
    }

    for (let index = 0; index < sources.length; index++) {
      const source = sources[index];
      const previousEndAt =
        index === 0
          ? startAt
          : new Date(
              sources[index - 1].lastManifestAppend.getTime() -
                LIVE_DELAY_SEC * 1000,
            );
      const sourceStartAt = new Date(
        source.createdAt!.getTime() - LIVE_DELAY_SEC * 1000,
      );
      if (sourceStartAt.getTime() - previousEndAt.getTime() > 1000 * 2) {
        const fillerDuration =
          (sourceStartAt.getTime() - previousEndAt.getTime()) / 1000;
        schedulerLogger.debug(
          `insert filler before source ${index}:${
            source.id
          }, duration: ${fillerDuration}`,
        );

        manifestRef.push(
          ...this.createFillerManifest(schedule.id, fillerDuration),
        );
      }

      manifestRef.push(
        ...source.manifest
          .filter(this.filterRtmpManifest(startAt, endAt))
          .map((item, index) => ({
            sourceId: source.id,
            offset: item[0],
            length: item[1],
            duration: item[2],
            discontiniuity: index === 0,
          })),
      );
    }

    const currentDuration = manifestRef.reduce(
      (dur, manifest) => dur + manifest.duration,
      0,
    );
    const totalLength = (endAt.getTime() - startAt.getTime()) / 1000;
    if (totalLength - currentDuration > 1000 * 2) {
      const fillerDuration = totalLength - currentDuration;
      schedulerLogger.debug(
        `insert filler after last source, duration: ${fillerDuration}`,
      );

      manifestRef.push(
        ...this.createFillerManifest(schedule.id, fillerDuration),
      );
    }

    return manifestRef;
  }

  private createTranscodedManifest(schedule: ScheduleDocument) {
    const { startAt, endAt } = schedule;
    const manifestRef: ManifestRef[] = [];

    let remain = (endAt.getTime() - startAt.getTime()) / 1000;

    if (schedule.source) {
      const source = schedule.source as TranscodedSourceDocument;

      for (const [index, item] of source.manifest.entries()) {
        remain -= item[2];
        manifestRef.push({
          sourceId: source.id,
          offset: item[0],
          length: item[1],
          duration: item[2],
          discontiniuity: index === 0,
        });

        if (remain < 5) break;
      }
    }

    if (remain > 0) {
      manifestRef.push(...this.createFillerManifest(schedule.id, remain));
    }

    return manifestRef;
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

  private async createFutureManifest(schedule: ScheduleDocument) {
    const manifests = await this.createManifestForSchedule(schedule);
    const elapsed = (Date.now() - schedule.startAt.getTime()) / 1000;

    const manifestResult: ManifestRef[] = [];

    let duration = 0;
    let skips = 0;
    for (const item of manifests) {
      duration += item.duration;

      if (duration >= elapsed) {
        manifestResult.push(item);
      } else {
        skips++;
      }
    }

    return { skips, manifestResult };
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
      const previousManifest = await this.createManifestForSchedule(
        previousSchedule,
      );

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

  async createManifest(): Promise<ManifestInput> {
    const now = Date.now();
    if (now - this.lastScheduleCacheUpdated >= SCHEDULE_CACHE_EXPIRES)
      await this.updateScheduleCache();

    const { next, current } = this.getRecentSchedule();
    const seqStart = await this.resolveSequenceStart(current);

    const { skips, manifestResult } = await this.createFutureManifest(current);

    if (manifestResult.length < 5 && next) {
      schedulerLogger.debug('manifest too short, use next schedule');
      const { manifestResult: nextManifest } = await this.createFutureManifest(
        next,
      );
      manifestResult.push(...nextManifest.slice(0, 5));
    } else if (manifestResult.length === 0) {
      throw new Error('channel not running');
    }

    return {
      seqBegin: seqStart + skips,
      items: manifestResult.slice(0, 5).map(item => ({
        duration: item.duration,
        url: `${config.appUrl}/api/ts/${item.sourceId}/${encodeSegmentRef(
          item.offset,
          item.length,
        )}.ts`,
        discontinuityBegin: item.discontiniuity,
      })),
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
