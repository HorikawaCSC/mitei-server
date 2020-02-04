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
