import {
  MutationResolvers,
  ViewerMetricsType,
} from '../../../generated/graphql';
import { setElapsed, setMessage } from '../../../streaming/viewer/state';
import { ensureDeviceUsed } from '../../../utils/gql/ensureUser';
import { redis, redisKeys } from '../../../utils/redis';

export const viewerMetricsMutationResolvers: MutationResolvers = {
  reportViewerMetrics: ensureDeviceUsed(
    async (_parent, { metrics }, { deviceInfo }) => {
      switch (metrics.type) {
        case ViewerMetricsType.Ping:
          await redis.set(redisKeys.viewerOnline(deviceInfo.id), 1, 'EX', 30);
          break;

        case ViewerMetricsType.Elapsed:
          if (!metrics.elapsed) throw new Error('elapsed is required');

          await setElapsed(deviceInfo.id, metrics.elapsed);
          break;

        case ViewerMetricsType.Error:
          if (!metrics.message) throw new Error('elapsed is required');

          await setMessage(deviceInfo.id, metrics.message);
          break;

        default:
          throw new Error('invalid metrics type');
      }

      return true;
    },
  ),
};
