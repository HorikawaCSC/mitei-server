import { ChannelResolvers } from '../../generated/graphql';
import { FileSourceDocument } from '../../models/FileSource';
import { RecordSourceDocument } from '../../models/RecordSource';
import { SourceRefType } from '../../models/streaming/SourceReference';
import { SourceType } from '../../models/TranscodedSource';
import { ensureLoggedInAsAdmin } from '../../utils/gql/ensureUser';

export const channelResolvers: ChannelResolvers = {
  createdBy: ensureLoggedInAsAdmin(async source => {
    await source.populate('createdBy', '-token -tokenSecret').execPopulate();
    if (!source.createdBy) throw new Error('failed to populate');

    return source.createdBy;
  }),
  fillerSources: async channel => {
    await channel.populate('fillerSources.source').execPopulate();

    if (!channel.fillerSources) throw new Error('failed to populate');

    return channel.fillerSources.map(ref => {
      if (!ref.source) throw new Error('failed to populate');

      if (ref.type === SourceRefType.RtmpInputDocument) {
        return ref.source!;
      } else if (ref.type === SourceRefType.TranscodedSourceDocument) {
        if (ref.source!.type === SourceType.Record) {
          return ref.source! as RecordSourceDocument;
        } else if (ref.source!.type === SourceType.File) {
          return ref.source! as FileSourceDocument;
        }
      }

      throw new Error('unknown source');
    });
  },
};
