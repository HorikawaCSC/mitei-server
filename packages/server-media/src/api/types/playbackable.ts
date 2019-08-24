import {
  Channel,
  SourceType,
  TranscodedSource,
  TranscodedSourceDocument,
} from '@mitei/server-models';
import { PlaybackableResolvers } from '../../generated/graphql';

export const playbackableResolvers: PlaybackableResolvers = {
  __resolveType: parent => {
    if (!('collection' in parent)) throw new Error();
    switch (parent.collection.name) {
      case Channel.collection.name:
        return 'Channel';
      case TranscodedSource.collection.name:
        if ((parent as TranscodedSourceDocument).type === SourceType.File)
          return 'FileSource';
        if ((parent as TranscodedSourceDocument).type === SourceType.Record)
          return 'RecordSource';
        break;
      default:
    }
    throw new Error();
  },
};
