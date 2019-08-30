import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { DateTimePicker } from '@material-ui/pickers';
import { DateTime } from 'luxon';
import * as React from 'react';

const useStyles = makeStyles({
  second: {
    width: 60,
  },
});

type Props = {
  value: DateTime;
  onChange: (value: DateTime) => void;
  label?: string;
  disabled?: boolean;
};
export const DateTimeWithSecondPicker = ({
  onChange,
  value,
  label,
  disabled,
}: Props) => {
  const styles = useStyles();
  const handleSecondChange = React.useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      const second = Math.min(Number(e.target.value), 59);
      onChange(value.set({ second }));
    },
    [value],
  );

  return (
    <Box>
      <DateTimePicker
        label={label}
        value={value}
        onChange={onChange as (value: unknown) => void}
        format='yyyy/MM/dd HH:mm'
        ampm={false}
        disabled={disabled}
      />
      <TextField
        className={styles.second}
        label={`${label}(秒)`}
        type='number'
        value={value.second}
        onChange={handleSecondChange}
        disabled={disabled}
      />
    </Box>
  );
};
