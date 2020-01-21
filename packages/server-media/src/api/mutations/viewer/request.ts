import { ViewerDevice } from '@mitei/server-models';
import {
  MutationResolvers,
  ViewerRequestType,
} from '../../../generated/graphql';
import { validateViewerSource } from '../../../streaming/viewer/source';
import { setPlayState, setStopState } from '../../../streaming/viewer/state';
import { redisKeys, redisPubSub } from '../../../utils/redis';

export const viewerRequestMutationResolvers: MutationResolvers = {
  updateViewerState: async (_parent, { request }) => {
    if (
      request.sourceType &&
      request.sourceId &&
      !(await validateViewerSource(request.sourceType, request.sourceId))
    ) {
      throw new Error('source not found');
    }

    const device = await ViewerDevice.findById(request.device);
    if (!device) {
      throw new Error('device not found');
    }

    switch (request.type) {
      case ViewerRequestType.Play:
        if (!request.sourceType || !request.sourceId)
          throw new Error('No source specified');
        if (!(await validateViewerSource(request.sourceType, request.sourceId)))
          throw new Error('Specified source not found');

        await setPlayState(device.id, request.sourceType, request.sourceId);
        break;

      case ViewerRequestType.Stop:
        await setStopState(device.id);
        break;

      case ViewerRequestType.Volume:
        if (!request.volume || request.volume < 0 || request.volume > 100)
          throw new Error('invalid volume');
        device.volume = request.volume;
        await device.save();
        break;

      default:
        throw new Error('Not implemented');
    }

    await redisPubSub.publish(redisKeys.viewerUpdate(request.device), true);
    return true;
  },
};
