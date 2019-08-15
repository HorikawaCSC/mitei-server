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
};

export const SourceTypeSelect = (props: Props) => {
  const handleChange = (e: React.ChangeEvent<{}>) => {
    props.onChange((e.target as HTMLInputElement).value as ProgramType);
  };

  return (
    <FormControl component='fieldset'>
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
