import { SourceType } from '@mitei/server-models';
import { TranscodedSourceResolvers } from '../../generated/graphql';
import { ensureLoggedInAsAdmin } from '../../utils/gql/ensureUser';

export const transcodedSourceResolvers: TranscodedSourceResolvers = {
  __resolveType: source => {
    if (source.type === SourceType.File) return 'FileSource';
    if (source.type === SourceType.Record) return 'RecordSource';

    return null;
  },
  createdBy: ensureLoggedInAsAdmin(async source => {
    await source.populate('createdBy', '-token -tokenSecret').execPopulate();
    if (!source.createdBy) throw new Error('failed to populate');

    return source.createdBy;
  }),
  preset: ensureLoggedInAsAdmin(async source => {
    await source.populate('preset').execPopulate();
    if (!source.preset) return null;

    return source.preset;
  }),
};
