import { ViewerDevice } from '@mitei/server-models';
import { MutationResolvers } from '../../../generated/graphql';
import { createToken, TokenType } from '../../../streaming/viewer/token';
import { ViewerChallengeData } from '../../../types/viewer';
import { ensureLoggedInAsAdmin } from '../../../utils/gql/ensureUser';
import { redis, redisKeys } from '../../../utils/redis';
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
