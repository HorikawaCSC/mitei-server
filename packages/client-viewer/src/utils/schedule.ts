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
