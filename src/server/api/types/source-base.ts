import { SourceBaseResolvers } from '../../generated/graphql';
import { FileSource } from '../../models/FileSource';
import { User } from '../../models/User';
import { ensureLoggedInAsAdmin } from '../../utils/gql/ensureUser';

export const sourceBaseResolvers: SourceBaseResolvers = {
  __resolveType: source => {
    if ((source as FileSource).sourceStatus) return 'FileSource';

    return null;
  },
  createdBy: ensureLoggedInAsAdmin(async source => {
    const user = await User.findOne(source.createdBy);
    if (!user) throw new Error('invalid data');
    return user;
  }),
};
