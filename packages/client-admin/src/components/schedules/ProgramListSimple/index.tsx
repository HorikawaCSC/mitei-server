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

import Typography from '@material-ui/core/Typography';
import { DateTime, Duration } from 'luxon';
import * as React from 'react';
import { GetScheduleListSimpleQuery } from '../../../api/generated/graphql';
import { programText } from '../../../utils/schedule';

type Props = {
  schedule: GetScheduleListSimpleQuery['scheduleList']['schedules'][0];
};
export const ProgramListSimple = ({ schedule }: Props) => {
  const startAt = DateTime.fromISO(schedule.startAt);
  const endAt = DateTime.fromISO(schedule.endAt);
  const duration = endAt.diff(startAt);
  const programDuration = Duration.fromMillis(
    schedule.programs.reduce((total, program) => total + program.duration, 0) *
      1000,
  );
  const lastFillerDuration = duration.minus(programDuration);

  return (
    <>
      {schedule.programs.map(program => (
        <Typography component='p' key={program.id}>
          {programText(program)}
        </Typography>
      ))}
      {lastFillerDuration.as('second') > 0 && (
        <Typography component='p'>
          自動フィラー {lastFillerDuration.toFormat('hh:mm:ss')}
        </Typography>
      )}
    </>
  );
};
