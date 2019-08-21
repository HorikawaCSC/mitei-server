import { Schedule } from '@mitei/server-models';
import { QueryResolvers } from '../../../generated/graphql';
import { omitUndefined } from '../../../utils/db';
import { ensureLoggedInAsAdmin } from '../../../utils/gql/ensureUser';

export const scheduleQueryResolvers: QueryResolvers = {
  scheduleList: ensureLoggedInAsAdmin(
    async (_parent, { take, skip, startAt, endAt, ...query }) => {
      const conditions = omitUndefined(query) as Record<string, unknown>;

      if (startAt) {
        conditions.endAt = { $gte: startAt };
      }

      if (endAt) {
        conditions.startAt = { $lte: endAt };
      }

      const total = await Schedule.countDocuments(conditions);
      const result = await Schedule.find(conditions)
        .skip(skip || 0)
        .limit(take || 10);

      return {
        schedules: result,
        total,
      };
    },
  ),
  schedule: ensureLoggedInAsAdmin(async (_parent, { id }) => {
    return (await Schedule.findById(id)) || null;
  }),
};
