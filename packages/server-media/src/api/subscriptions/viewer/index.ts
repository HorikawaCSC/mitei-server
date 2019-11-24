import { SubscriptionResolvers } from '../../../generated/graphql';
import { memorizedPubSubIterator, redisKeys } from '../../../utils/redis';

export const viewerSubscriptionResolvers: SubscriptionResolvers = {
  viewerRequest: {
    subscribe(_parent, _args, { deviceInfo }) {
      if (!deviceInfo) throw new Error('not authorized');
      return memorizedPubSubIterator(
        redisKeys.viewerRequest(deviceInfo.id),
        3600,
      );
    },
  },
};
