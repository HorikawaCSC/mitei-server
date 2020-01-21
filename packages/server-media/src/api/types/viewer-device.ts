import { ViewerDeviceResolvers } from '../../generated/graphql';
import {
  getElapsed,
  getMessage,
  getPlayingContent,
  getState,
} from '../../streaming/viewer/state';
import { redis, redisKeys } from '../../utils/redis';

export const viewerDeviceResolvers: ViewerDeviceResolvers = {
  online: async device => {
    const exists = await redis.exists(redisKeys.viewerOnline(device.id));
    return !!exists;
  },
  state: async device => {
    return await getState(device.id);
  },
  message: async device => {
    return await getMessage(device.id);
  },
  elapsed: async device => {
    return await getElapsed(device.id);
  },
  playingContent: async device => {
    return await getPlayingContent(device.id);
  },
};
