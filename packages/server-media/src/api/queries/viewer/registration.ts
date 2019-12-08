import { QueryResolvers } from '../../../generated/graphql';
import { ViewerChallengeData } from '../../../types/viewer';
import { redis, redisKeys } from '../../../utils/redis';
import { parseToken, TokenType } from '../../../utils/viewer/token';

export const viewerRegistrationQueryResolvers: QueryResolvers = {
  viewerRequests: async () => {
    const requestIds = (
      await redis.keys(redisKeys.deviceChallenge('*'))
    ).map(key => key.replace(redisKeys.deviceChallenge(''), ''));
    if (requestIds.length === 0) {
      return [];
    }

    const requests: ViewerChallengeData[] = ((await redis.mget(
      ...requestIds.map(id => redisKeys.deviceChallenge(id)),
    )) as string[]).map(data => JSON.parse(data));

    return requestIds
      .filter((_id, i) => !requests[i].accept)
      .map((id, i) => ({
        id,
        requestFrom: requests[i].from,
        code: requests[i].code,
        type: requests[i].type,
        createdAt: new Date(requests[i].date),
      }));
  },
  viewerChallengeResult: async (_parent, { token }) => {
    const { type, deviceId } = parseToken(token);
    if (type !== TokenType.Registration) {
      throw new Error('not registration token');
    }

    const challenge = await redis.get(redisKeys.deviceChallenge(deviceId));
    if (!challenge) {
      throw new Error('invalid request');
    }

    const challengeData: ViewerChallengeData = JSON.parse(challenge);

    return {
      token: challengeData.token || '',
      success: challengeData.accept,
    };
  },
  viewerInfo: async (_parent, _args, { deviceInfo }) => {
    if (deviceInfo) {
      return deviceInfo;
    }
    return null;
  },
};
