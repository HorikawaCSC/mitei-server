import { ViewerDevice } from '@mitei/server-models';
import { MutationResolvers } from '../../../generated/graphql';

export const viewerDeviceMutationResolvers: MutationResolvers = {
  updateViewer: async (_parent, { deviceId, displayName }) => {
    const device = await ViewerDevice.findById(deviceId);
    if (!device) throw new Error('device not found');

    if (displayName) {
      device.displayName = displayName;
    }

    return await device.save();
  },
};
