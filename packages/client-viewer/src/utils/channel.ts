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
