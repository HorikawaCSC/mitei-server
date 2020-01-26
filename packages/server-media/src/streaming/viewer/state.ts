import {
  Channel,
  ChannelDocument,
  FileSourceDocument,
  RecordSourceDocument,
  TranscodedSource,
} from '@mitei/server-models';
import { ViewerSourceType, ViewerState } from '../../generated/graphql';
import { redis, redisKeys } from '../../utils/redis';

export const setPlayState = async (
  deviceId: string,
  sourceType: ViewerSourceType,
  sourceId: string,
) => {
  await redis.hset(redisKeys.viewerState(deviceId), 'sourceType', sourceType);
  await redis.hset(redisKeys.viewerState(deviceId), 'sourceId', sourceId);
  await redis.hset(
    redisKeys.viewerState(deviceId),
    'state',
    ViewerState.Playing,
  );
};

export const setStopState = async (deviceId: string) => {
  await redis.hdel(redisKeys.viewerState(deviceId), 'sourceType');
  await redis.hdel(redisKeys.viewerState(deviceId), 'sourceId');
  await redis.hset(
    redisKeys.viewerState(deviceId),
    'state',
    ViewerState.Stopped,
  );
};

export const setElapsed = async (deviceId: string, elapsed: number) => {
  await redis.hset(redisKeys.viewerState(deviceId), 'elasped', elapsed);
};

export const setMessage = async (deviceId: string, message: string) => {
  await redis.hset(redisKeys.viewerState(deviceId), 'message', message);
};

export const getMessage = async (deviceId: string) => {
  return await redis.hget(redisKeys.viewerState(deviceId), 'message');
};

export const getElapsed = async (deviceId: string) => {
  const elapsed = await redis.hget(redisKeys.viewerState(deviceId), 'elasped');
  if (!elapsed) return null;

  const elapsedNum = Number(elapsed);

  if (isNaN(elapsedNum)) throw new Error('elapsed is not number');

  return elapsedNum;
};

export const getState = async (deviceId: string) => {
  const state = await redis.hget(redisKeys.viewerState(deviceId), 'state');

  if (!state) return ViewerState.Stopped;
  if (Object.values(ViewerState).indexOf(state as ViewerState) < 0)
    throw new Error('Invalid state');

  return state as ViewerState;
};

export const getPlayingContent = async (
  deviceId: string,
): Promise<
  null | FileSourceDocument | RecordSourceDocument | ChannelDocument
> => {
  const type = (await redis.hget(
    redisKeys.viewerState(deviceId),
    'sourceType',
  )) as ViewerSourceType | null;

  if (!type) return null;
  if (Object.values(ViewerSourceType).indexOf(type) < 0)
    throw new Error('Invalid state');

  const id = await redis.hget(redisKeys.viewerState(deviceId), 'sourceId');
  switch (type) {
    case ViewerSourceType.Channel:
      return await Channel.findById(id);

    case ViewerSourceType.Source:
      return (await TranscodedSource.findById(id)) as
        | FileSourceDocument
        | RecordSourceDocument;

    default:
      throw new Error('invalid type');
  }
};
