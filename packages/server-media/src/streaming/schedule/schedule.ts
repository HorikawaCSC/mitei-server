import { ProgramType, Schedule, ScheduleDocument } from '@mitei/server-models';
import { ObjectId } from 'mongodb';
import { schedulerLogger } from '../../utils/logging';
import { redis } from '../../utils/redis';

const SCHEDULE_EXPIRE = 90;
const key = (channelId: string) => `mitei:sch:${channelId}`;

type ScheduleDataRedis = {
  s: number;
  e: number;
  p: Array<{
    t: ProgramType;
    s?: string;
    d: number;
  }>;
};

export type ProgramData = {
  type: ProgramType;
  sourceId?: ObjectId;
  duration: number;
};

export type ScheduleData = {
  id: string;
  startAt: number;
  endAt: number;
  programs: ProgramData[];
};

const dataToRedis = (data: ScheduleData): ScheduleDataRedis => {
  return {
    s: data.startAt,
    e: data.endAt,
    p: data.programs.map(program => ({
      t: program.type,
      s: program.sourceId ? program.sourceId.toHexString() : undefined,
      d: program.duration,
    })),
  };
};

const redisToData = (id: string, data: ScheduleDataRedis): ScheduleData => {
  return {
    id,
    startAt: data.s,
    endAt: data.e,
    programs: data.p.map(program => ({
      type: program.t,
      sourceId: program.s ? new ObjectId(program.s) : undefined,
      duration: program.d,
    })),
  };
};

export const entityToData = (entity: ScheduleDocument): ScheduleData => {
  return {
    id: entity.id!,
    programs: entity.programs,
    startAt: entity.startAt.getTime(),
    endAt: entity.endAt.getTime(),
  };
};

export const getScheduleCache = async (
  channelId: string,
  reExpire = false,
): Promise<ScheduleData[] | null> => {
  const keyName = key(channelId);
  const schedules: Record<string, string> = ((await redis.hgetall(
    keyName,
  )) as unknown) as Record<string, string>;
  if (schedules !== null) {
    const result: ScheduleData[] = Object.keys(schedules).map(id =>
      redisToData(id, JSON.parse(schedules[id])),
    );

    if (reExpire) await redis.expire(keyName, SCHEDULE_EXPIRE);

    return result.length > 0 ? result : null;
  }
  return null;
};

export const updateScheduleCache = async (channelId: string) => {
  const keyName = key(channelId);
  const now = new Date();
  const schedules = await Schedule.find({
    endAt: {
      $gt: now,
    },
  }).limit(2);
  const current = schedules.find(
    ({ startAt, endAt }) => startAt <= now && endAt >= now,
  );

  if (!current) {
    schedulerLogger.debug('no current schedule, skipped to cache');
    return null;
  }

  const hasCurrent = await redis.hexists(keyName, current.id!);
  if (!hasCurrent) {
    const currentData = dataToRedis(entityToData(current));
    if (
      !(await redis.hsetnx(keyName, current.id!, JSON.stringify(currentData)))
    ) {
      schedulerLogger.debug('other server stored current schedule');
    } else {
      schedulerLogger.debug('stored current schedule');
    }
  } else {
    schedulerLogger.debug('already stored current schedule');
  }

  const currentEndAt = current.endAt.getTime();
  const nowTime = now.getTime();
  const next = schedules.find(
    ({ startAt }) =>
      startAt.getTime() - currentEndAt >= 0 && // later than current program
      startAt.getTime() - currentEndAt < 1000 * 60, // not so far from current program
  );
  if (next) {
    if (next.startAt.getTime() - nowTime > 1000 * 60) {
      // more than 60 sec to reach next
      const nextData = dataToRedis(entityToData(next));
      if (!(await redis.hset(keyName, next.id!, JSON.stringify(nextData)))) {
        schedulerLogger.debug('updated next schedule');
      } else {
        schedulerLogger.debug('stored next schedule');
      }
    } else {
      schedulerLogger.debug('next schedule is too reached to cache');
    }
  } else {
    schedulerLogger.debug('no next schedule, cache current only');
  }

  await redis.expire(keyName, SCHEDULE_EXPIRE);
  const cacheKeys: string[] = await redis.hkeys(keyName);
  const unusedCacheKeys = cacheKeys.filter(
    key => key !== current.id && (!next || key !== next.id),
  );

  if (unusedCacheKeys.length > 0) {
    const keyCount = await redis.hdel(keyName, ...unusedCacheKeys);
    schedulerLogger.debug('removed unused key', unusedCacheKeys, keyCount);
  }

  return await getScheduleCache(channelId);
};
