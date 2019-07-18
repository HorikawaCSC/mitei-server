import { MutationResolvers } from '../../../../generated/graphql';
import { Channel } from '../../../../models/streaming/Channel';
import { Schedule } from '../../../../models/streaming/Schedule';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';

export const scheduleMutationResolvers: MutationResolvers = {
  createSchedule: ensureLoggedInAsAdmin(
    async (_parent, { channelId, startAt, endAt }, { userInfo }) => {
      if (startAt.getTime() < Date.now()) {
        throw new Error('startAt must be earlier than now');
      }

      if (endAt.getTime() <= startAt.getTime()) {
        throw new Error('startAt must be earlier than endAt');
      }

      if (endAt.getTime() - startAt.getTime() < 60 * 1000) {
        throw new Error('duration must be longer than a minute');
      }

      const overlappedSchedule = await Schedule.find({
        $or: [
          {
            startAt: {
              $gte: startAt,
              $lt: endAt,
            },
          },
          {
            endAt: {
              $gt: startAt,
              $lte: endAt,
            },
          },
        ],
      });

      if (overlappedSchedule.length > 0) {
        throw new Error('schedule overlapping found');
      }

      const schedule = new Schedule();

      const channel = await Channel.findById(channelId);
      if (!channel) throw new Error('channel not found');

      schedule.channelId = channel._id;
      schedule.createdById = userInfo._id;
      schedule.startAt = startAt;
      schedule.endAt = endAt;

      return await schedule.save();
    },
  ),
};
