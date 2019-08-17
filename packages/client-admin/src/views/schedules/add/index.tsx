import { ExecutionResult } from '@apollo/react-common';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { Add } from '@material-ui/icons';
import { DateTimePicker } from '@material-ui/pickers';
import { PageContainer, useErrorDialog } from '@mitei/client-common';
import { DateTime } from 'luxon';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import useRouter from 'use-react-router';
import {
  AddScheduleMutation,
  useAddScheduleMutation,
} from '../../../api/generated/graphql';
import { useCommonStyles } from '../../../styles/common';

const useStyles = makeStyles(theme =>
  createStyles({
    secondBox: {
      width: 60,
    },
    button: {
      margin: theme.spacing(1, 0, 0, 0),
    },
  }),
);

export const ScheduleCreateView = ({
  match,
}: RouteComponentProps<{ channelId: string }>) => {
  const { channelId } = match.params;
  const [addSchedule] = useAddScheduleMutation();
  const [title, setTitle] = React.useState('');
  const [startAt, setStartAt] = React.useState(() =>
    DateTime.local().set({ second: 0, millisecond: 0 }),
  );
  const [endAt, setEndAt] = React.useState(() =>
    DateTime.local()
      .plus({ minute: 30 })
      .set({ second: 0, millisecond: 0 }),
  );
  const styles = useStyles();
  const commonStyles = useCommonStyles();
  const showError = useErrorDialog();
  const { history } = useRouter();

  const handleChangeTitle = React.useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      setTitle(e.target.value as string);
    },
    [],
  );

  React.useEffect(() => {
    if (endAt.diff(startAt).as('second') < 0) {
      setEndAt(startAt.plus({ minute: 1 }));
    }
  }, [startAt]);

  const handleChangeStartAtSec = React.useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      const second = Math.min(Number(e.target.value), 59);
      setStartAt(startAt.set({ second }));
    },
    [startAt],
  );

  const handleChangeEndAtSec = React.useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      const second = Math.min(Number(e.target.value), 59);
      setEndAt(endAt.set({ second }));
    },
    [startAt],
  );

  const handleAddSchedule = React.useCallback(async () => {
    const { errors, data } = (await addSchedule({
      variables: {
        startAt: startAt.set({ millisecond: 0 }).toISO(),
        endAt: endAt.set({ millisecond: 0 }).toISO(),
        title,
        channelId,
      },
    })) as ExecutionResult<AddScheduleMutation>;

    if (errors || !data || !data.createSchedule) {
      showError(errors ? errors[0].message : 'エラーです');
      return;
    }

    history.push(`/schedules/-/${data.createSchedule.id}`);
  }, [startAt, endAt, title]);

  const duration = React.useMemo(() => {
    return endAt.diff(startAt);
  }, [startAt, endAt]);

  const addable = React.useMemo<boolean>(
    () => !!title && duration.as('second') > 60,
    [title, duration],
  );

  return (
    <PageContainer title='スケジュール追加'>
      <TextField
        fullWidth
        label='タイトル'
        value={title}
        onChange={handleChangeTitle}
      />
      <Box className={commonStyles.centerBox}>
        <Box>
          <DateTimePicker
            label='開始(分)'
            value={startAt}
            onChange={setStartAt as (value: unknown) => void}
            format='yyyy/MM/dd HH:mm'
            ampm={false}
          />
          <TextField
            className={styles.secondBox}
            label='開始(秒)'
            type='number'
            value={startAt.second}
            onChange={handleChangeStartAtSec}
          />
        </Box>
        <Typography>〜</Typography>
        <Box>
          <DateTimePicker
            label='終了'
            value={endAt}
            onChange={setEndAt as (value: unknown) => void}
            format='yyyy/MM/dd HH:mm'
            minDate={startAt}
            ampm={false}
          />
          <TextField
            className={styles.secondBox}
            label='終了(秒)'
            type='number'
            value={endAt.second}
            onChange={handleChangeEndAtSec}
          />
        </Box>
        <Typography>長さ: {duration.toFormat('hh:mm:ss')}</Typography>
      </Box>
      <Button
        variant='contained'
        color='primary'
        className={styles.button}
        disabled={!addable}
        onClick={handleAddSchedule}
      >
        <Add />
        <Typography>追加</Typography>
      </Button>
    </PageContainer>
  );
};
