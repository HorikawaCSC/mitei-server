import { SourceReferenceResolvers } from '../../generated/graphql';
import { FileSource } from '../../models/FileSource';
import { RecordSource } from '../../models/RecordSource';
import { RtmpInput } from '../../models/RtmpInput';

export const sourceReferenceResolvers: SourceReferenceResolvers = {
  __resolveType: sourceRef => {
    switch (sourceRef.collection.name) {
      case RtmpInput.collection.name:
        return 'RtmpInput';
      case FileSource.collection.name:
        return 'FileSource';
      case RecordSource.collection.name:
        return 'RecordSource';
      default:
        throw new Error();
    }
  },
};
