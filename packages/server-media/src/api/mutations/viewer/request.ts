import { ViewerDevice } from '@mitei/server-models';
import {
  MutationResolvers,
  ViewerRequestType,
} from '../../../generated/graphql';
import { validateViewerSource } from '../../../streaming/viewer/validate';
import { redisKeys, redisPubSub } from '../../../utils/redis';

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
