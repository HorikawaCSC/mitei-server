import { DateTime } from 'luxon';
import * as React from 'react';
import { useGetNearSchedulesQuery } from '../api/generated/graphql';

export const useChannelPlay = (channelId: string) => {
  const [now, setNow] = React.useState(() => DateTime.local().toISO());
  const {
    data: nearScheduleData,
    error: nearScheduleError,
    refetch,
  } = useGetNearSchedulesQuery({
    variables: {
      now,
      channelId,
    },
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = DateTime.local().toISO();
      setNow(now);
      refetch({
        channelId,
        now,
      });
    }, 1000 * 30);

    return () => clearInterval(timer);
  });

  const current = React.useMemo(() => {
    if (
      !nearScheduleData ||
      !nearScheduleData.scheduleList ||
      nearScheduleError
    )
      return;
    const { schedules } = nearScheduleData.scheduleList;
    const now = Date.now();

    const current = schedules.find(schedule => {
      return (
        new Date(schedule.startAt).getTime() < now &&
        new Date(schedule.endAt).getTime() > now
      );
    });

    return current;
  }, [nearScheduleData, now]);

  React.useEffect(() => {
    const now = Date.now();
    if (current) {
      const toNextTime = new Date(current.endAt).getTime() - now - 1000 * 5;
      if (toNextTime < 0) return;

      const timer = setTimeout(() => {
        const now = DateTime.local().toISO();
        setNow(now);
        refetch({
          channelId,
          now,
        });
      }, toNextTime);

      return () => clearInterval(timer);
    }
    return;
  }, [nearScheduleData]);

  const available = React.useMemo(() => {
    if (
      !nearScheduleData ||
      !nearScheduleData.scheduleList ||
      nearScheduleError
    )
      return false;
    const { schedules } = nearScheduleData.scheduleList;
    const now = Date.now();

    return schedules.some(schedule => {
      return (
        new Date(schedule.startAt).getTime() < now &&
        new Date(schedule.endAt).getTime() > now
      );
    });
  }, [nearScheduleData, now]);

  const endReaching = React.useMemo(() => {
    if (!current) return true;
    if (
      !nearScheduleData ||
      !nearScheduleData.scheduleList ||
      nearScheduleError
    )
      return false;
    const { schedules } = nearScheduleData.scheduleList;
    const now = Date.now();

    return (
      !schedules.some(schedule => new Date(schedule.startAt).getTime() > now) &&
      new Date(current.endAt).getTime() - now < 1000 * 10
    );
  }, [nearScheduleData, now]);

  return [available, endReaching];
};
