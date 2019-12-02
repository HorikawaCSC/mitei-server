import { Channel, Schedule } from '@mitei/server-models';
import { MutationResolvers } from '../../../../generated/graphql';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';
import { checkOverlappedSchedule } from '../../../../utils/schedule/validate';

export const scheduleMutationResolvers: MutationResolvers = {
  createSchedule: ensureLoggedInAsAdmin(
    async (_parent, { channelId, startAt, endAt, title }, { userInfo }) => {
      if (startAt.getTime() < Date.now() - 1000 * 60 * 60 * 24) {
        throw new Error('startAt must be earlier than now');
      }

      if (endAt.getTime() <= startAt.getTime()) {
        throw new Error('startAt must be earlier than endAt');
      }

      if (endAt.getTime() - startAt.getTime() < 60 * 1000) {
        throw new Error('duration must be longer than a minute');
      }

      if (await checkOverlappedSchedule(startAt, endAt)) {
        throw new Error('schedule overlapping found');
      }

      const schedule = new Schedule();

      const channel = await Channel.findById(channelId);
      if (!channel) throw new Error('channel not found');

      schedule.channelId = channel._id;
      schedule.createdById = userInfo._id;
      schedule.title = title;
      schedule.startAt = startAt;
      schedule.endAt = endAt;
      schedule.programs = [];

      return await schedule.save();
    },
  ),
  updateSchedule: ensureLoggedInAsAdmin(
    async (_parent, { scheduleId, startAt, endAt, title }) => {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) throw new Error('schedule not found');

      if (startAt) schedule.startAt = startAt;
      if (endAt) schedule.endAt = endAt;
      if (title) schedule.title = title;

      if (!schedule.isProgramValid()) {
        throw new Error('schedule contains too long program');
      }

      if (
        await checkOverlappedSchedule(
          schedule.startAt,
          schedule.endAt,
          schedule._id,
        )
      ) {
        throw new Error('schedule overlapping found');
      }

      return await schedule.save();
    },
  ),
};
