import { User } from '@mitei/server-models';
import { QueryResolvers } from '../../../generated/graphql';
import { omitUndefined } from '../../../utils/db';
import { ensureLoggedInAsAdmin } from '../../../utils/gql/ensureUser';

export const usersQueryResolver: QueryResolvers = {
  me: (_parent, _args, { userInfo }) => {
    return userInfo || null;
  },
  users: ensureLoggedInAsAdmin(async (_parent, { kind, type, skip, take }) => {
    const conditions = omitUndefined({
      kind,
      type,
    });

    const count = await User.countDocuments(conditions);
    const result = await User.find(conditions)
      .skip(skip || 0)
      .limit(take || 0);

    return {
      users: result,
      total: count,
    };
  }),
};
