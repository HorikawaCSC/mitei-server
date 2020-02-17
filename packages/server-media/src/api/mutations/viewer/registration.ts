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
import { MutationResolvers } from '../../../generated/graphql';
import { createToken, TokenType } from '../../../streaming/viewer/token';
import { ViewerChallengeData } from '../../../types/viewer';
import { ensureLoggedInAsAdmin } from '../../../utils/gql/ensureUser';
import { redis, redisKeys, redisPubSub } from '../../../utils/redis';
import { createUniqueId } from '../../../utils/unique-id';

export const viewerRegistrationMutationResolvers: MutationResolvers = {
  createViewerChallenge: async (_parent, { device }, { requestAddr }) => {
    const deviceId = createUniqueId();
    const code = createUniqueId(12);
    const deviceInfo: ViewerChallengeData = {
      type: device,
      date: Date.now(),
      code,
      accept: false,
      from: requestAddr,
    };
    await redis.set(
      redisKeys.deviceChallenge(deviceId),
      JSON.stringify(deviceInfo),
      'EX',
      60 * 5,
    );

    await redisPubSub.publish(redisKeys.viewerChallengeReceived(), true);

    const token = createToken(TokenType.Registration, deviceId, 60 * 5);

    return {
      token,
      code,
    };
  },
  acceptViewerChallenge: ensureLoggedInAsAdmin(
    async (_parent, { deviceId }) => {
      const challenge = await redis.get(redisKeys.deviceChallenge(deviceId));
      if (!challenge) {
        throw new Error('challenge not found or expired');
      }

      const challengeData: ViewerChallengeData = JSON.parse(challenge);

      if (challengeData.accept) {
        throw new Error('challenge already accepted');
      }

      const device = new ViewerDevice({
        _id: deviceId,
        displayName: `Device: ${deviceId}`,
        deviceType: challengeData.type,
      });
      await device.save();

      const token = createToken(
        TokenType.AuthorizedClient,
        deviceId,
        60 * 60 * 24 * 365 * 10, // 10 years
      );

      await redis.set(
        redisKeys.deviceChallenge(deviceId),
        JSON.stringify({
          ...challengeData,
          accept: true,
          token,
        }),
        'EX',
        60,
      );

      return true;
    },
  ),
};
