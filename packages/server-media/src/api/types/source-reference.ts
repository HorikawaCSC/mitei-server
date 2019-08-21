import {
  RtmpInput,
  TranscodedSource,
  TranscodedSourceDocument,
} from '@mitei/server-models';
import { SourceReferenceResolvers } from '../../generated/graphql';

export const sourceReferenceResolvers: SourceReferenceResolvers = {
  __resolveType: sourceRef => {
    if (!('collection' in sourceRef)) throw new Error();
    switch (sourceRef.collection.name) {
      case TranscodedSource.collection.name:
        if ((sourceRef as TranscodedSourceDocument).type === 'record') {
          return 'RecordSource';
        } else {
          return 'FileSource';
        }
      case RtmpInput.collection.name:
        return 'RtmpInput';
      default:
        throw new Error();
    }
  },
};
