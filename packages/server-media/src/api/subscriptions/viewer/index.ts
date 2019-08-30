import { SubscriptionResolvers } from '../../../generated/graphql';
import { redisKeys, redisPubSub } from '../../../utils/redis';

export const viewerSubscriptionResolvers: SubscriptionResolvers = {
  viewerRequest: {
    subscribe(_parent, _args, { deviceInfo }) {
      if (!deviceInfo) throw new Error('not authorized');
      return redisPubSub.asyncIterator(redisKeys.viewerRequest(deviceInfo.id));
    },
  },
};
