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

import { DateTime } from 'luxon';

type ScheduleBase = { startAt: Date | string; endAt: Date | string };
type ScheduleTime<T = {}> = Omit<T, 'startAt' | 'endAt'> & {
  startAt: DateTime;
  endAt: DateTime;
};

export const convertSchedules = <T extends ScheduleBase>(schedules: T[]) => {
  return schedules.map(
    schedule =>
      ({
        ...schedule,
        startAt:
          typeof schedule.startAt === 'string'
            ? DateTime.fromISO(schedule.startAt).toLocal()
            : DateTime.fromJSDate(schedule.startAt),
        endAt:
          typeof schedule.endAt === 'string'
            ? DateTime.fromISO(schedule.endAt).toLocal()
            : DateTime.fromJSDate(schedule.endAt),
      } as ScheduleTime<T>),
  );
};

export const filterContinuousSchedules = <T extends ScheduleTime>(
  schedules: T[],
  now = DateTime.local(),
): T[] => {
  const sortedSchedules = schedules
    .slice()
    .sort(({ startAt: s1 }, { startAt: s2 }) => s1.valueOf() - s2.valueOf());
  const current = sortedSchedules.findIndex(({ startAt, endAt }) => {
    return startAt <= now && endAt >= now;
  });
  if (current < 0) return [];

  let last = current + 1;
  for (; last < sortedSchedules.length; last++) {
    if (sortedSchedules.length - 1 === last) {
      break;
    }

    if (
      !sortedSchedules[last - 1].endAt.equals(sortedSchedules[last].startAt)
    ) {
      break;
    }
  }

  console.log(current, last);

  return sortedSchedules.slice(current, last);
};
