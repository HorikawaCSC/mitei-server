import { MutationResolvers } from '../../../../generated/graphql';
import { Channel } from '../../../../models/streaming/Channel';
import { Schedule } from '../../../../models/streaming/Schedule';
import { TranscodedSource } from '../../../../models/TranscodedSource';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';

export const scheduleMutationResolvers: MutationResolvers = {
  createSchedule: ensureLoggedInAsAdmin(
    async (_parent, { channelId, startAt, endAt, sourceIds }, { userInfo }) => {
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

      if (sourceIds.length > 0) {
        const sources = await TranscodedSource.find({
          _id: {
            $in: sourceIds,
          },
        });

        if (sources.length !== sourceIds.length) {
          throw new Error('invalid ids');
        }

        schedule.sourceIds = sources.map(source => source._id);
      }

      schedule.channelId = channel._id;
      schedule.createdById = userInfo._id;
      schedule.startAt = startAt;
      schedule.endAt = endAt;

      return await schedule.save();
    },
  ),
};
