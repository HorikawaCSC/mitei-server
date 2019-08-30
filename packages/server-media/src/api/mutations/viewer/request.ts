import { MutationResolvers } from '../../../generated/graphql';
import { redisKeys, redisPubSub } from '../../../utils/redis';
import { validateViewerSource } from '../../../utils/viewer/validate';

export const viewerRequestMutationResolvers: MutationResolvers = {
  dispatchViewerRequest: async (_parent, { request }) => {
    if (
      request.sourceType &&
      request.sourceId &&
      !(await validateViewerSource(request.sourceType, request.sourceId))
    ) {
      throw new Error('source not found');
    }

    await redisPubSub.publish(redisKeys.viewerRequest(request.device), {
      viewerRequest: request,
    });
    return true;
  },
};
