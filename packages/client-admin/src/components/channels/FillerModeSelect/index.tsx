import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import * as React from 'react';
import { FillerControl } from '../../../api/generated/graphql';

type Props = {
  value: FillerControl;
  onChange: (value: FillerControl) => void;
  disabled?: boolean;
};
export const FillerModeSelect = (props: Props) => {
  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    props.onChange(e.target.value as FillerControl);
  };
  return (
    <FormControl disabled={props.disabled}>
      <InputLabel htmlFor='source'>フィラー配信モード</InputLabel>
      <Select
        value={props.value}
        disabled={props.disabled}
        onChange={handleChange}
      >
        <MenuItem value={FillerControl.Random}>
          <ListItemText
            primary='ランダム'
            secondary='スケジュール枠に応じてランダムで配信します'
          />
        </MenuItem>
        <MenuItem value={FillerControl.Sequential}>
          <ListItemText
            primary='指定順'
            secondary='リストの上から順番に配信します'
          />
        </MenuItem>
      </Select>
    </FormControl>
  );
};
