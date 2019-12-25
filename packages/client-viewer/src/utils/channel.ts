import { DateTime } from 'luxon';
import * as React from 'react';
import { useGetNearSchedulesQuery } from '../api/generated/graphql';
import { convertSchedules, filterContinuousSchedules } from './schedule';

export const useChannelPlay = (channelId: string): [boolean, number] => {
  const [now, setNow] = React.useState(() => DateTime.local());
  const {
    data: nearScheduleData,
    error: nearScheduleError,
  } = useGetNearSchedulesQuery({
    variables: {
      now: now.toISO(),
      channelId,
    },
  });

  React.useEffect(() => {
    const updateTimer = setInterval(() => {
      setNow(DateTime.local());
    }, 1000 * 30);

    return () => {
      clearInterval(updateTimer);
    };
  });

  const continuousSchedules = React.useMemo(() => {
    if (!nearScheduleData || nearScheduleError) return [];

    const sch = filterContinuousSchedules(
      convertSchedules(nearScheduleData.scheduleList.schedules),
    );
    console.log(sch);
    return sch;
  }, [nearScheduleData, now]);

  const current =
    continuousSchedules.length > 0 ? continuousSchedules[0] : null;

  if (nearScheduleError) return [false, 0];
  if (!current) return [false, 0];

  const last = continuousSchedules[continuousSchedules.length - 1];
  const remained = last.endAt
    .diff(DateTime.local(), 'millisecond')
    .as('millisecond');

  console.log(continuousSchedules, current, remained);
  return [!!current && remained > 10 * 1000, remained];
};
