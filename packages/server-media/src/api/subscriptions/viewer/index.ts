import { ViewerDevice } from '@mitei/server-models';
import { SubscriptionResolvers } from '../../../generated/graphql';
import {
  ensureDeviceUsed,
  ensureLoggedInAsAdmin,
} from '../../../utils/gql/ensureUser';
import { redis, redisKeys, redisPubSub } from '../../../utils/redis';

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
  viewerUpdateDevice: {
    async subscribe(_parent, { id }) {
      if (!(await ViewerDevice.findById(id))) throw new Error('not found');
      return redisPubSub.asyncIterator<boolean>(redisKeys.viewerUpdate(id));
    },
    resolve: ensureLoggedInAsAdmin(
      async (_payload: unknown, { id }: { id: string }) => {
        const newDevice = await ViewerDevice.findById(id);
        if (!newDevice) {
          throw new Error('no device');
        }

        return newDevice;
      },
    ),
  },
  viewerRequestsPolling: {
    subscribe() {
      return redisPubSub.asyncIterator<boolean>(
        redisKeys.viewerChallengeReceived(),
      );
    },
    async resolve() {
      return (await redis.keys(redisKeys.deviceChallenge('*'))).length;
    },
  },
};
