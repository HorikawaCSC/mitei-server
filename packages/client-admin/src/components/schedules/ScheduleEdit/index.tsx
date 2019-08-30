import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { DateTime, Duration } from 'luxon';
import * as React from 'react';
import { useCommonStyles } from '../../../styles/common';
import { DateTimeWithSecondPicker } from '../../shared/DateTimeWithSecondPicker';

type Props = {
  onChangeTitle: (value: string) => void;
  title: string;
  onChangeStartAt: (value: DateTime) => void;
  startAt: DateTime;
  onChangeEndAt: (value: DateTime) => void;
  endAt: DateTime;
  disabled?: boolean;
  onChangeDuration?: (duration: Duration) => void;
};

export const ScheduleEdit = ({
  onChangeTitle,
  title,
  onChangeStartAt,
  startAt,
  onChangeEndAt,
  endAt,
  disabled,
  onChangeDuration,
}: Props) => {
  const commonStyles = useCommonStyles();

  const handleChangeTitle = React.useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      onChangeTitle(e.target.value as string);
    },
    [],
  );

  const duration = React.useMemo(() => {
    return endAt.diff(startAt);
  }, [startAt, endAt]);

  React.useEffect(() => {
    if (onChangeDuration) onChangeDuration(duration);
  }, [duration]);

  return (
    <>
      <TextField
        fullWidth
        label='タイトル'
        value={title}
        onChange={handleChangeTitle}
        disabled={disabled}
      />
      <Box className={commonStyles.centerBox}>
        <DateTimeWithSecondPicker
          value={startAt}
          onChange={onChangeStartAt}
          label='開始'
          disabled={disabled}
        />
        <Typography>〜</Typography>
        <DateTimeWithSecondPicker
          value={endAt}
          onChange={onChangeEndAt}
          label='終了'
          disabled={disabled}
        />
        <Typography>長さ: {duration.toFormat('hh:mm:ss')}</Typography>
      </Box>
    </>
  );
};
