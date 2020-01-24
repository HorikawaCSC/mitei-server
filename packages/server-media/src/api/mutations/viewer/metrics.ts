import {
  MutationResolvers,
  ViewerMetricsType,
} from '../../../generated/graphql';
import { setElapsed, setMessage } from '../../../streaming/viewer/state';
import { ensureDeviceUsed } from '../../../utils/gql/ensureUser';
import { redis, redisKeys, redisPubSub } from '../../../utils/redis';

export const viewerMetricsMutationResolvers: MutationResolvers = {
  reportViewerMetrics: ensureDeviceUsed(
    async (_parent, { metrics }, { deviceInfo }) => {
      switch (metrics.type) {
        case ViewerMetricsType.Ping:
          await redis.set(
            redisKeys.viewerOnline(deviceInfo.id),
            Date.now(),
            'NX',
          );
          await redis.expire(redisKeys.viewerOnline(deviceInfo.id), 30);
          break;

        case ViewerMetricsType.Elapsed:
          if (!metrics.elapsed) throw new Error('elapsed is required');

          await setElapsed(deviceInfo.id, metrics.elapsed);
          await redisPubSub.publish(
            redisKeys.viewerUpdate(deviceInfo.id),
            true,
          );
          break;

        case ViewerMetricsType.Error:
          if (!metrics.message) throw new Error('message is required');

          await setMessage(deviceInfo.id, metrics.message);
          await redisPubSub.publish(
            redisKeys.viewerUpdate(deviceInfo.id),
            true,
          );
          break;

        default:
          throw new Error('invalid metrics type');
      }

      return true;
    },
  ),
};
