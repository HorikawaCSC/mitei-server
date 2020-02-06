import { ViewerDevice } from '@mitei/server-models';
import { MutationResolvers } from '../../../generated/graphql';
import { redis, redisKeys } from '../../../utils/redis';

export const viewerDeviceMutationResolvers: MutationResolvers = {
  updateViewer: async (_parent, { deviceId, displayName }) => {
    const device = await ViewerDevice.findById(deviceId);
    if (!device) throw new Error('device not found');

    if (displayName) {
      device.displayName = displayName;
    }

    return await device.save();
  },
  removeViewer: async (_parent, { deviceId }) => {
    const device = await ViewerDevice.findById(deviceId);
    if (!device) throw new Error('device not found');

    if (await redis.exists(redisKeys.viewerOnline(device.id))) {
      throw new Error('device is online');
    }

    await device.remove();

    return true;
  },
};
