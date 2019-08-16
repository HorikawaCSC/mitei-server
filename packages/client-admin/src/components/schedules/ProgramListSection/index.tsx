import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
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
    variables: {
      scheduleId: schedule.id,
    },
  });
  const showError = useErrorDialog();
  const [disabled, setDisabled] = React.useState(true);

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

  const handleAddButton = React.useCallback(async () => {
    await addEmptyProgram();
    if (addEmptyProgramError) {
      showError(addEmptyProgramError.message);
    }
  }, []);

  const handleDisabledChange = React.useCallback(
    (_e: React.ChangeEvent, checked: boolean) => {
      setDisabled(!checked);
    },
    [disabled],
  );

  return (
    <PageContainer title='プログラム一覧' mini>
      <FormControlLabel
        control={<Switch checked={!disabled} onChange={handleDisabledChange} />}
        label='編集'
      />
      {schedule.programs.map((_program, index) => (
        <ProgramItem
          index={index}
          schedule={schedule}
          scheduleDuration={scheduleDuration}
          disabled={disabled}
        />
      ))}
      {scheduleDuration > programsDuration ? (
        <PageContainer title='自動フィラー' mini>
          <Typography>
            自動フィラー {scheduleDuration - programsDuration}秒
          </Typography>
        </PageContainer>
      ) : null}
      <Button
        onClick={handleAddButton}
        variant='contained'
        color='primary'
        disabled={disabled}
      >
        <Add />
        追加
      </Button>
    </PageContainer>
  );
};
