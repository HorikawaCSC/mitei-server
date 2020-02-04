/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
  MutationResolvers,
  ViewerMetricsType,
} from '../../../generated/graphql';
import {
  setElapsed,
  setMessage,
  setStopState,
} from '../../../streaming/viewer/state';
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
          if (typeof metrics.elapsed !== 'number')
            throw new Error('elapsed is required');

          await setElapsed(deviceInfo.id, metrics.elapsed);
          break;

        case ViewerMetricsType.Error:
          if (!metrics.message) throw new Error('message is required');

          await setMessage(deviceInfo.id, metrics.message);
          break;

        case ViewerMetricsType.Ended:
          await setStopState(deviceInfo.id);
          break;

        default:
          throw new Error('invalid metrics type');
      }

      await redisPubSub.publish(redisKeys.viewerUpdate(deviceInfo.id), true);

      return true;
    },
  ),
};
