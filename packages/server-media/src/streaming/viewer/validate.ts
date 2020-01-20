import { Channel, TranscodedSource } from '@mitei/server-models';
import { ViewerSourceType } from '../../generated/graphql';

export const validateViewerSource = async (
  sourceType: ViewerSourceType,
  sourceId: string,
) => {
  try {
    switch (sourceType) {
      case ViewerSourceType.Source:
        return await TranscodedSource.exists({ _id: sourceId });
      case ViewerSourceType.Channel:
        return await Channel.exists({ _id: sourceId });
      default:
    }
    return false;
  } catch (err) {
    return false;
  }
};
