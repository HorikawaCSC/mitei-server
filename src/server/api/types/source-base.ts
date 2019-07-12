import { SourceBaseResolvers } from '../../generated/graphql';
import { FileSourceDocument } from '../../models/FileSource';
import { ensureLoggedInAsAdmin } from '../../utils/gql/ensureUser';

export const sourceBaseResolvers: SourceBaseResolvers = {
  __resolveType: source => {
    if ((source as FileSourceDocument).source) return 'FileSource';

    return null;
  },
  createdBy: ensureLoggedInAsAdmin(async source => {
    await source.populate('createdBy').execPopulate();
    if (!source.createdBy) throw new Error('failed to populate');

    return source.createdBy;
  }),
  preset: ensureLoggedInAsAdmin(async source => {
    await source.populate('preset').execPopulate();
    if (!source.preset) return null;

    return source.preset;
  }),
};
