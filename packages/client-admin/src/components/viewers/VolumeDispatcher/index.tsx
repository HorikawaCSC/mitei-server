import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';
import * as React from 'react';
import {
  ViewerRequestParam,
  ViewerRequestType,
} from '../../../api/generated/graphql';

type Props = {
  onDispatch: (request: Omit<ViewerRequestParam, 'device'>) => void;
  currentVolume?: number;
};
export const VolumeDispatcher = (props: Props) => {
  const [volume, setVolume] = React.useState(props.currentVolume || 100);

  const handleVolumeChange = React.useCallback(
    (_e, value: number | number[]) => {
      setVolume(value as number);
    },
    [volume],
  );

  const dispatch = React.useCallback(() => {
    props.onDispatch({
      type: ViewerRequestType.Volume,
      volume,
    });
  }, [volume, props]);
  return (
    <Box>
      <FormGroup>
        <FormLabel>ボリューム</FormLabel>
        <Slider onChange={handleVolumeChange} value={volume} />
        <Button variant='contained' size='large' onClick={dispatch}>
          実行
        </Button>
      </FormGroup>
    </Box>
  );
};
