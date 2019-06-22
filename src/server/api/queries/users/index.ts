import { QueryResolvers } from '../../../generated/graphql';
import { User } from '../../../models/User';
import { ensureLoggedInAsAdmin } from '../../../utils/gql/ensureUser';

export const usersQueryResolver: QueryResolvers = {
  me: (_parent, _args, { userInfo }) => {
    return userInfo || null;
  },
  users: ensureLoggedInAsAdmin(async (_parent, { kind, type, skip, take }) => {
    const [result, count] = await User.findAndCount({
      where: { kind: kind || undefined, type: type || undefined },
      skip: skip || 0,
      take: take || 10,
    });

    return {
      users: result,
      total: count,
    };
  }),
};
