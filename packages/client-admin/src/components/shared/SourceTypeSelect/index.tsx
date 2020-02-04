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

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import * as React from 'react';
import { ProgramType } from '../../../api/generated/graphql';

type Props = {
  value: ProgramType;
  onChange: (value: ProgramType) => void;
  disabled?: boolean;
};

export const SourceTypeSelect = (props: Props) => {
  const handleChange = (e: React.ChangeEvent<{}>) => {
    props.onChange((e.target as HTMLInputElement).value as ProgramType);
  };

  return (
    <FormControl component='fieldset' disabled={props.disabled}>
      <FormLabel component='legend'>ソース種別</FormLabel>
      <RadioGroup value={props.value} onChange={handleChange} row>
        <FormControlLabel
          value={ProgramType.Empty}
          control={<Radio />}
          label='なし'
        />
        <FormControlLabel
          value={ProgramType.Rtmp}
          control={<Radio />}
          label='生放送'
        />
        <FormControlLabel
          value={ProgramType.Transcoded}
          control={<Radio />}
          label='エンコード済み'
        />
      </RadioGroup>
    </FormControl>
  );
};
