import { FillerControl } from '../../models/streaming/Channel';
import { Manifest } from '../../models/TranscodedSource';
import { schedulerLogger } from '../logging';
import { redis } from '../redis';

const FILLER_EXPIRE = 60;
const key = (channelId: string) => `mitei:chfill:${channelId}`;

type FillerDataRedis = {
  m: FillerControl;
  d: Array<{
    i: string;
    m: Manifest[];
  }>;
};

type FillerData = {
  fillerControl: FillerControl;
  fillerSources: Array<{
    id: string;
    manifest: Manifest[];
  }>;
};

export const getChannelFillerList = async (
  channelId: string,
  reExpire = false,
): Promise<FillerData | null> => {
  const fillers = await redis.get(key(channelId));
  if (fillers !== null) {
    const fillersData: FillerDataRedis = JSON.parse(fillers);
    if (reExpire) await redis.expire(key(channelId), FILLER_EXPIRE);

    return {
      fillerControl: fillersData.m,
      fillerSources: fillersData.d.map(data => ({
        id: data.i,
        manifest: data.m,
      })),
    };
  }
  return null;
};

export const setChannelFillerList = async (
  channelId: string,
  data: FillerData,
) => {
  const fillersData: FillerDataRedis = {
    m: data.fillerControl,
    d: data.fillerSources.map(filler => ({
      i: filler.id,
      m: filler.manifest,
    })),
  };
  const result = await redis.set(
    key(channelId),
    JSON.stringify(fillersData),
    'EX',
    FILLER_EXPIRE,
    'NX',
  );
  if (!result) {
    schedulerLogger.debug('filler: other server locked seq key, retry');

    const actual = await getChannelFillerList(channelId);
    if (actual === null)
      throw new Error('filler: other server locked key and failed to retry');

    return actual;
  }

  schedulerLogger.debug('filler cache stored');
  return data;
};
