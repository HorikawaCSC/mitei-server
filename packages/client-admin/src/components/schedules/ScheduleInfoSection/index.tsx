import { ExecutionResult } from '@apollo/react-common';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { CheckCircle, Error } from '@material-ui/icons';
import {
  PageContainer,
  useErrorDialog,
  useMessageSnack,
} from '@mitei/client-common';
import clsx from 'clsx';
import { Duration } from 'luxon';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  GetScheduleQuery,
  useUpdateScheduleMutation,
} from '../../../api/generated/graphql';
import { useCommonStyles } from '../../../styles/common';
import { toDate } from '../../../utils/datetime';
import { ScheduleEdit } from '../ScheduleEdit';

const useStyles = makeStyles({
  invalid: {
    backgroundColor: 'rgba(255, 0, 0, .1)',
  },
  valid: {
    backgroundColor: 'rgba(0, 255, 0, .1)',
  },
});

type Props = {
  schedule: NonNullable<GetScheduleQuery['schedule']>;
};
export const ScheduleInfoSection = ({ schedule }: Props) => {
  const styles = useStyles();
  const commonStyles = useCommonStyles();
  const [updateSchedule] = useUpdateScheduleMutation();
  const showError = useErrorDialog();
  const showMessage = useMessageSnack();

  const { channel, isValid } = schedule;
  const [title, setTitle] = React.useState(schedule.title);
  const [startAt, setStartAt] = React.useState(() => toDate(schedule.startAt));
  const [endAt, setEndAt] = React.useState(() => toDate(schedule.endAt));
  const [duration, setDuration] = React.useState(() => Duration.fromMillis(0));
  const channelUrl = `/channels/${channel.id}`;
  const [editMode, setEditMode] = React.useState(false);

  const handleChangeEditMode = React.useCallback(
    (_e: React.ChangeEvent, value: boolean) => setEditMode(value),
    [editMode],
  );

  const handleReset = React.useCallback(() => {
    setTitle(schedule.title);
    setStartAt(toDate(schedule.startAt));
    setEndAt(toDate(schedule.endAt));
  }, [schedule, title, startAt, endAt]);

  const handleSave = React.useCallback(async () => {
    const { errors } = (await updateSchedule({
      variables: {
        scheduleId: schedule.id,
        title,
        startAt: startAt.toISO(),
        endAt: endAt.toISO(),
      },
    })) as ExecutionResult;

    if (errors) {
      showError(errors[0].message);
      handleReset();
      return;
    }

    showMessage('保存しました');
  }, [title, startAt, endAt]);

  const valid = React.useMemo<boolean>(
    () => !!title && duration.as('second') > 60,
    [title, duration],
  );

  return (
    <PageContainer title='スケジュール詳細'>
      <FormControlLabel
        control={<Switch checked={editMode} onChange={handleChangeEditMode} />}
        label='編集'
      />
      <ScheduleEdit
        title={title}
        onChangeTitle={setTitle}
        startAt={startAt}
        onChangeStartAt={setStartAt}
        endAt={endAt}
        onChangeEndAt={setEndAt}
        disabled={!editMode}
        onChangeDuration={setDuration}
      />
      <Typography>
        チャンネル:{' '}
        <Link component={RouterLink} to={channelUrl}>
          {channel.displayName}
        </Link>
      </Typography>
      <Button
        variant='contained'
        color='primary'
        disabled={!editMode || !valid}
        onClick={handleSave}
      >
        保存
      </Button>
      <Box
        className={clsx(
          { [styles.invalid]: !isValid, [styles.valid]: isValid },
          commonStyles.centerBox,
        )}
      >
        {isValid ? <CheckCircle /> : <Error />}
        <Typography>
          {isValid ? '有効です' : '不正なスケジュールのため、放送されません'}
        </Typography>
      </Box>
    </PageContainer>
  );
};
