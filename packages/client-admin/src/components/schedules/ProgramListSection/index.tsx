import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Add } from '@material-ui/icons';
import { PageContainer, useErrorDialog } from '@mitei/client-common';
import * as React from 'react';
import {
  GetScheduleQuery,
  useAddEmptyProgramMutation,
} from '../../../api/generated/graphql';
import { toDate } from '../../../utils/datetime';
import { ProgramItem } from './item';

type Props = {
  schedule: NonNullable<GetScheduleQuery['schedule']>;
};

export const ProgramListSection = ({ schedule }: Props) => {
  const [
    addEmptyProgram,
    { error: addEmptyProgramError },
  ] = useAddEmptyProgramMutation({
    errorPolicy: 'all',
    variables: {
      scheduleId: schedule.id,
    },
  });
  const showError = useErrorDialog();

  const scheduleDuration = React.useMemo(() => {
    return toDate(schedule.endAt)
      .diff(toDate(schedule.startAt))
      .as('seconds');
  }, [schedule]);

  const programsDuration = React.useMemo(() => {
    return schedule.programs.reduce(
      (total, program) => total + program.duration,
      0,
    );
  }, [schedule]);

  const handleAddButton = async () => {
    await addEmptyProgram();
    if (addEmptyProgramError) {
      showError(addEmptyProgramError.message);
    }
  };

  return (
    <PageContainer title='プログラム一覧' mini>
      {schedule.programs.map((_program, index) => (
        <ProgramItem
          index={index}
          schedule={schedule}
          scheduleDuration={scheduleDuration}
        />
      ))}
      {scheduleDuration > programsDuration ? (
        <PageContainer title='自動フィラー' mini>
          <Typography>
            自動フィラー {scheduleDuration - programsDuration}秒
          </Typography>
        </PageContainer>
      ) : null}
      <Button onClick={handleAddButton} variant='contained' color='primary'>
        <Add />
        追加
      </Button>
    </PageContainer>
  );
};
