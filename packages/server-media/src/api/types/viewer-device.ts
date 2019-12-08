import {
  ViewerDeviceResolvers,
  ViewerElapsedMetrics,
  ViewerErrorMetrics,
  ViewerMetrics,
  ViewerMetricsType,
} from '../../generated/graphql';
import { redis, redisKeys } from '../../utils/redis';

export const viewerDeviceResolvers: ViewerDeviceResolvers = {
  online: async device => {
    const exists = await redis.exists(redisKeys.viewerMetrics(device.id));
    return !!exists;
  },
  metrics: async device => {
    const metrics = ((await redis.hgetall(
      redisKeys.viewerMetrics(device.id),
    )) as unknown) as Record<string, string>;
    return Object.keys(metrics)
      .map(type => {
        if (type === ViewerMetricsType.Elapsed) {
          return {
            elapsed: Number(metrics[type]),
            __typename: 'ViewerElapsedMetrics',
          } as ViewerElapsedMetrics;
        }
        if (type === ViewerMetricsType.Error) {
          return {
            message: metrics[type],
            __typename: 'ViewerErrorMetrics',
          } as ViewerErrorMetrics;
        }
        return null;
      })
      .filter((data): data is ViewerMetrics => !!data);
  },
};
