import { UserRole } from '@mitei/server-models';
import { MutationResolvers } from '../../../../generated/graphql';
import { ensureLoggedIn } from '../../../../utils/gql/ensureUser';
import { redis, redisKeys } from '../../../../utils/redis';
import { createUniqueId } from '../../../../utils/unique-id';

export const usersMutationResolvers: MutationResolvers = {
  createPromoteInvite: async (_parent, { role }) => {
    const inviteId = createUniqueId(16);
    await redis.set(redisKeys.roleInvite(inviteId), role, 'EX', 60 * 10);
    return inviteId;
  },
  consumePromoteInvite: ensureLoggedIn(
    async (_parent, { id }, { userInfo }) => {
      const role = await redis.get(redisKeys.roleInvite(id));
      if (role && (Object.values(UserRole) as string[]).indexOf(role) >= 0) {
        userInfo.role = role as UserRole;
      }
      return await userInfo.save();
    },
  ),
};
