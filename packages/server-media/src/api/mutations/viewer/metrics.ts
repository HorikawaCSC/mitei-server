import {
  MutationResolvers,
  ViewerMetricsType,
} from '../../../generated/graphql';
import { ensureDeviceUsed } from '../../../utils/gql/ensureUser';
import { redis, redisKeys } from '../../../utils/redis';

export const viewerMetricsMutationResolvers: MutationResolvers = {
  reportViewerMetrics: ensureDeviceUsed(
    async (_parent, { metrics }, { deviceInfo }) => {
      const key = redisKeys.viewerMetrics(deviceInfo.id);
      if (metrics.type === ViewerMetricsType.Ping) {
        await redis.hset(key, metrics.type, 1);
      } else if (metrics.type === ViewerMetricsType.Elapsed) {
        await redis.hset(key, metrics.type, metrics.elapsed);
      } else if (metrics.type === ViewerMetricsType.Error) {
        await redis.hset(key, metrics.type, metrics.message);
      }

      await redis.expire(key, 30);
      return true;
    },
  ),
};
