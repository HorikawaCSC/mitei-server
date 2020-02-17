/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Channel, Schedule } from '@mitei/server-models';
import { MutationResolvers } from '../../../../generated/graphql';
import { checkOverlappedSchedule } from '../../../../streaming/schedule/validate';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';

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
  removeSchedule: async (_parent, { scheduleId }) => {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) throw new Error('schedule not found');

    const now = Date.now();
    if (schedule.startAt.getTime() < now && schedule.endAt.getTime() > now) {
      throw new Error('schedule is now running');
    }

    await schedule.remove();

    return true;
  },
};
