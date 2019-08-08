import { QueryResolvers } from '../../../generated/graphql';
import { Schedule } from '../../../models/streaming/Schedule';
import { ensureLoggedInAsAdmin } from '../../../utils/gql/ensureUser';

export const scheduleQueryResolvers: QueryResolvers = {
  scheduleList: ensureLoggedInAsAdmin(async (_parent, { take, skip }) => {
    const total = await Schedule.countDocuments();
    const result = await Schedule.find()
      .skip(skip || 0)
      .limit(take || 10);

    return {
      schedules: result,
      total,
    };
  }),
};
