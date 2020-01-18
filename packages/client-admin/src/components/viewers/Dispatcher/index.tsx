import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import * as React from 'react';
import {
  ViewerRequestParam,
  ViewerRequestType,
} from '../../../api/generated/graphql';
import { PlayDispatcher } from '../PlayDispatcher';
import { StopDispatcher } from '../StopDispatcher';
import { VolumeDispatcher } from '../VolumeDispatcher';

type Props = {
  onDispatch: (request: Omit<ViewerRequestParam, 'device'>) => void;
};
export const Dispatcher = (props: Props) => {
  const [mode, setMode] = React.useState<ViewerRequestType>(
    ViewerRequestType.Play,
  );
  const handleModeChange = React.useCallback(
    (_e, value) => {
      setMode(value as ViewerRequestType);
    },
    [mode],
  );

  return (
    <Box>
      <FormControl>
        <FormLabel>操作</FormLabel>
        <RadioGroup value={mode} onChange={handleModeChange}>
          <FormControlLabel
            value={ViewerRequestType.Play}
            label='再生'
            control={<Radio />}
          />
          <FormControlLabel
            value={ViewerRequestType.Stop}
            label='停止'
            control={<Radio />}
          />
          <FormControlLabel
            value={ViewerRequestType.Volume}
            label='音量設定'
            control={<Radio />}
          />
        </RadioGroup>
      </FormControl>
      {mode === ViewerRequestType.Play && (
        <PlayDispatcher onDispatch={props.onDispatch} />
      )}
      {mode === ViewerRequestType.Volume && (
        <VolumeDispatcher onDispatch={props.onDispatch} />
      )}
      {mode === ViewerRequestType.Stop && (
        <StopDispatcher onDispatch={props.onDispatch} />
      )}
    </Box>
  );
};
