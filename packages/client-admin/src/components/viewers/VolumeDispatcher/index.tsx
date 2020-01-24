import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import * as React from 'react';
import {
  ViewerDevice,
  ViewerRequestParam,
  ViewerRequestType,
} from '../../../api/generated/graphql';

type Props = {
  onDispatch: (request: Omit<ViewerRequestParam, 'device'>) => void;
  device: Pick<ViewerDevice, 'volume'>;
};
export const VolumeDispatcher = (props: Props) => {
  const [volume, setVolume] = React.useState(props.device.volume || 100);

  const handleVolumeChange = React.useCallback(
    (_e, value: number | number[]) => {
      setVolume(value as number);
    },
    [volume],
  );

  React.useEffect(() => {
    setVolume(props.device.volume);
  }, [props.device]);

  const dispatch = React.useCallback(() => {
    props.onDispatch({
      type: ViewerRequestType.Volume,
      volume,
    });
  }, [volume, props]);
  return (
    <Box>
      <Grid container spacing={4}>
        <Grid item sm={2}>
          <FormLabel>ボリューム</FormLabel>
        </Grid>
        <Grid item sm={5} xs={8}>
          <FormGroup>
            <Slider onChange={handleVolumeChange} value={volume} />
          </FormGroup>
        </Grid>
        <Grid item sm={2}>
          <Button variant='contained' size='large' onClick={dispatch}>
            実行
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
