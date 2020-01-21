import { ViewerDevice } from '@mitei/server-models';
import { SubscriptionResolvers } from '../../../generated/graphql';
import { ensureDeviceUsed } from '../../../utils/gql/ensureUser';
import { redisKeys, redisPubSub } from '../../../utils/redis';

export const viewerSubscriptionResolvers: SubscriptionResolvers = {
  viewerUpdate: {
    subscribe(_parent, _args, { deviceInfo }) {
      if (!deviceInfo) throw new Error('not authorized');
      return redisPubSub.asyncIterator<boolean>(
        redisKeys.viewerUpdate(deviceInfo.id),
      );
    },
    resolve: ensureDeviceUsed(
      async (_payload: unknown, _args: unknown, { deviceInfo }) => {
        const newDevice = await ViewerDevice.findById(deviceInfo.id);
        if (!newDevice) {
          throw new Error('no device');
        }

        return newDevice;
      },
    ),
  },
};
