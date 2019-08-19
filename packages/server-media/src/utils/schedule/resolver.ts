import { ObjectID } from 'bson';
import { crc32 } from 'crc';
import { config } from '../../config';
import { RecordSource } from '../../models/RecordSource';
import { RtmpInput } from '../../models/RtmpInput';
import {
  Channel,
  ChannelDocument,
  FillerControl,
} from '../../models/streaming/Channel';
import { ProgramType, Schedule } from '../../models/streaming/Schedule';
import {
  TranscodedSource,
  TranscodeStatus,
} from '../../models/TranscodedSource';
import { ManifestInput } from '../hls/manifest';
import { encodeSegmentRef } from '../hls/segment-ref';
import { schedulerLogger } from '../logging';
import { EMPTY_FILLER_MAX_DURATION } from './empty-filler';
import { getChannelFillerList, setChannelFillerList } from './filler';
import { ManifestList } from './manifest-list';
import {
  entityToData as convertScheduleDoc,
  getScheduleCache,
  ProgramData,
  ScheduleData,
  updateScheduleCache,
} from './schedule';
import { getSequenceStart, setSequenceStart } from './sequence';

const SCHEDULE_CACHE_UPDATE_INTERVAL = 1000 * 30;
const LIVE_DELAY_SEC = 20;
const MANIFEST_DURATION = 15;
const MANIFEST_MIN_SIZE = 4;

export interface ManifestRef {
  type: 'source' | 'empty';
  sourceId: string;
  offset: number;
  length: number;
  duration: number;
  discontiniuity: boolean;
}

const dateDiffSec = (big: number, small: number) => (big - small) / 1000;

export class ScheduleResolver {
  private lastScheduleCacheUpdated = 0;

  constructor(private channelId: string) {}

  private async getRecentSchedule() {
    const now = Date.now();
    let schedule = await getScheduleCache(this.channelId, true);

    if (!schedule) {
      schedule = await updateScheduleCache(this.channelId);

      if (!schedule) {
        throw new Error('no current schedule');
      }
    }

    const current = schedule.find(
      value => value.startAt <= now && value.endAt >= now,
    );
    if (!current) throw new Error('no current schedule');

    const next = schedule.find(value => value.startAt >= now);

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

  private async updateFillerCache() {
    const channel = await Channel.findById(this.channelId);
    if (!channel) throw new Error('channel not found');

    const fillers = await TranscodedSource.find({
      _id: { $in: channel.fillerSourceIds },
      status: TranscodeStatus.Success,
    });
    return await setChannelFillerList(channel.id, {
      fillerControl: channel.fillerControl,
      fillerSources: fillers.map(data => ({
        id: data.id || '',
        manifest: data.manifest,
      })),
    });
  }

  private async createFillerManifest(scheduleId: string, duration: number) {
    const manifestList = new ManifestList();

    let fillerData = await getChannelFillerList(this.channelId, true);
    if (!fillerData) {
      fillerData = await this.updateFillerCache();
    }
    if (fillerData.fillerSources.length === 0) {
      return this.createEmptyFiller(duration);
    }

    const scheduleCrc = crc32(scheduleId);
    const availableFillers = fillerData.fillerSources;

    const skips =
      fillerData.fillerControl === FillerControl.Sequential
        ? 0
        : Math.abs(scheduleCrc & 0xffff) % availableFillers.length;
    const step =
      fillerData.fillerControl === FillerControl.Sequential
        ? 1
        : Math.abs(scheduleCrc >> 16) % availableFillers.length;

    let remain = duration;

    for (
      let index = skips;
      remain > 0;
      index = (index + step) % availableFillers.length
    ) {
      const filler = availableFillers[index];

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

  private async resolveRtmpInputs(
    id: ObjectID,
    startAt: number,
    endAt: number,
  ) {
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

  private filterRtmpManifest(startAtTime: number, endAtTime: number) {
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

  private async createRtmpInputProgramManifest(
    schedule: ScheduleData,
    program: ProgramData,
    programStartAt: number,
  ) {
    const rtmp = program.sourceId
      ? await RtmpInput.findById(program.sourceId)
      : null;

    const programEndAt = programStartAt + program.duration * 1000;
    const sources = rtmp
      ? await this.resolveRtmpInputs(rtmp._id, programStartAt, programEndAt)
      : [];
    const manifestList = new ManifestList();
    const programDuration = dateDiffSec(programEndAt, programStartAt);

    if (sources.length === 0) {
      manifestList.loadFromList(
        await this.createFillerManifest(schedule.id, programDuration),
      );

      return manifestList;
    }

    for (let index = 0; index < sources.length; index++) {
      const source = sources[index];
      const sourceStartAt = source.createdAt!.getTime() - LIVE_DELAY_SEC * 1000;

      // (source begin date) - (program start date)
      const durationBetweenStartAndSource = dateDiffSec(
        sourceStartAt,
        programStartAt,
      );
      if (durationBetweenStartAndSource > 0) {
        const fillerDuration =
          durationBetweenStartAndSource - manifestList.totalDuration;
        if (fillerDuration > 1) {
          schedulerLogger.debug(
            `insert filler before source ${index}:${source.id}, duration: ${fillerDuration}`,
          );

          manifestList.loadFromList(
            await this.createFillerManifest(schedule.id, fillerDuration),
          );
        }
      }

      manifestList.loadFromSource(
        source,
        this.filterRtmpManifest(programStartAt, programEndAt),
      );
    }

    const lastFillerDuration = programDuration - manifestList.totalDuration;
    if (lastFillerDuration > 1) {
      schedulerLogger.debug(
        `insert filler after last source, duration: ${lastFillerDuration}`,
      );

      manifestList.loadFromList(
        await this.createFillerManifest(schedule.id, lastFillerDuration),
      );
    }

    schedulerLogger.debug(
      `live schedule duration:`,
      manifestList.totalDuration,
    );

    return manifestList;
  }

  private async createTranscodedProgramManifest(
    schedule: ScheduleData,
    program: ProgramData,
    programStartAt: number,
  ) {
    // const { startAt, endAt } = schedule;
    const manifestList = new ManifestList();
    const programEndAt = programStartAt + program.duration * 1000;
    const programDuration = dateDiffSec(programEndAt, programStartAt);
    const source = program.sourceId
      ? await TranscodedSource.findById(program.sourceId)
      : null;

    if (source) {
      manifestList.loadFromSource(
        source,
        (nextDuration, _loaded, total) => {
          return total + nextDuration <= programDuration;
        },
        true,
      );
    }

    const remain = programDuration - manifestList.totalDuration;
    if (remain > 0) {
      manifestList.loadFromList(
        await this.createFillerManifest(schedule.id, remain),
      );
    }

    return manifestList;
  }

  private async createEmptyProgramManifest(
    schedule: ScheduleData,
    program: ProgramData,
  ) {
    const manifestList = new ManifestList();
    if (program.duration > 0) {
      manifestList.loadFromList(
        await this.createFillerManifest(schedule.id, program.duration),
      );
    }

    return manifestList;
  }

  private async createProgramManifest(
    schedule: ScheduleData,
    program: ProgramData,
    programEndAt: number,
  ) {
    if (program.type === ProgramType.Rtmp) {
      return await this.createRtmpInputProgramManifest(
        schedule,
        program,
        programEndAt,
      );
    } else if (program.type === ProgramType.Transcoded) {
      return await this.createTranscodedProgramManifest(
        schedule,
        program,
        programEndAt,
      );
    } else if (program.type === ProgramType.Empty) {
      return await this.createEmptyProgramManifest(schedule, program);
    } else {
      throw new Error('unknown source');
    }
  }

  private async createManifestForSchedule(schedule: ScheduleData) {
    const manifestList = new ManifestList();
    let programStartAt = schedule.startAt;
    for (let index = 0; index < schedule.programs.length; index++) {
      const program = schedule.programs[index];
      manifestList.loadFromList(
        await this.createProgramManifest(schedule, program, programStartAt),
      );
      programStartAt = programStartAt + program.duration * 1000;
    }

    const scheduleDuration = (schedule.endAt - schedule.startAt) / 1000;
    if (scheduleDuration - manifestList.totalDuration > 2) {
      manifestList.loadFromList(
        await this.createFillerManifest(
          schedule.id,
          scheduleDuration - manifestList.totalDuration,
        ),
      );
    }

    return manifestList;
  }

  private async createFutureManifest(
    schedule: ScheduleData,
    maxDuration = MANIFEST_DURATION,
    minSize = MANIFEST_MIN_SIZE,
  ) {
    const manifest = await this.createManifestForSchedule(schedule);
    const elapsed = dateDiffSec(Date.now(), schedule.startAt);

    schedulerLogger.debug('manifest duration', manifest.totalDuration);
    return manifest.select(elapsed, maxDuration, minSize);
  }

  private async resolveSequenceStart(schedule: ScheduleData) {
    const currentSeq = await getSequenceStart(schedule.id, true);
    if (currentSeq !== null) return currentSeq;

    const previousSchedule = await Schedule.findOne({
      endAt: {
        $gte: schedule.startAt - 1000,
        $lte: schedule.startAt,
      },
      channel: this.channelId,
    }).exec();

    if (!previousSchedule) {
      return await setSequenceStart(schedule.id, 0);
    }

    const previousSeq = await getSequenceStart(previousSchedule.id);
    if (previousSeq !== null) {
      const {
        manifest: previousManifest,
      } = await this.createManifestForSchedule(
        convertScheduleDoc(previousSchedule),
      );

      schedulerLogger.debug(
        'prev sequence',
        previousSeq,
        '->',
        previousSeq + previousManifest.length,
      );

      return await setSequenceStart(
        schedule.id,
        previousSeq + previousManifest.length,
      );
    } else {
      return await setSequenceStart(schedule.id, 0);
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
    if (now - this.lastScheduleCacheUpdated >= SCHEDULE_CACHE_UPDATE_INTERVAL) {
      await updateScheduleCache(this.channelId);
      this.lastScheduleCacheUpdated = now;
    }

    const { next, current } = await this.getRecentSchedule();
    const seqStart = await this.resolveSequenceStart(current);

    const { skips, manifest, duration } = await this.createFutureManifest(
      current,
    );

    if (duration < MANIFEST_DURATION && next) {
      schedulerLogger.debug('manifest too short, use next schedule');
      const { manifest: nextManifest } = await this.createFutureManifest(
        next,
        MANIFEST_DURATION - duration,
        0,
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

  const scheduler = new ScheduleResolver(channel.id as string);
  resolvers.set(channel.id, scheduler);

  return scheduler;
};
