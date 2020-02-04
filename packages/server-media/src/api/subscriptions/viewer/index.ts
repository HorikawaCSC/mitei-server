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
