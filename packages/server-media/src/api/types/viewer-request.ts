import { Channel, TranscodedSource } from '@mitei/server-models';
import {
  ViewerRequestResolvers,
  ViewerSourceType,
} from '../../generated/graphql';

export const viewerRequestResolvers: ViewerRequestResolvers = {
  // @ts-ignore
  source: async parent => {
    if (!parent.sourceType || !parent.sourceId) return null;

    if (parent.sourceType === ViewerSourceType.Source) {
      return await TranscodedSource.findById(parent.sourceId);
    } else if (parent.sourceType === ViewerSourceType.Channel) {
      return await Channel.findById(parent.sourceId);
    }
    return null;
  },
};
