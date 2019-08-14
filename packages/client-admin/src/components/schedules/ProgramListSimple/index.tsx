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
          自動フィラー {lastFillerDuration.toFormat('HH:mm:ss')}
        </Typography>
      )}
    </>
  );
};
