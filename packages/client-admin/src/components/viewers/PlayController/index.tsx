import { ButtonGroup, Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import {
  GetSourcesSimpleQuery,
  TranscodeStatus,
  ViewerRequestParam,
  ViewerRequestType,
  ViewerSourceType,
  ViewerState,
  ViewerStateSingleSubscription,
} from '../../../api/generated/graphql';
import { ChannelSelect } from '../../shared/ChannelSelect';
import { SourceSelect } from '../../shared/SourceSelect';

type Props = {
  onDispatch: (request: Omit<ViewerRequestParam, 'device'>) => void;
  device: Pick<
    ViewerStateSingleSubscription['viewerUpdateDevice'],
    'playingContent' | 'state'
  >;
};
export const PlayController = (props: Props) => {
  const [sourceType, setSourceType] = React.useState<ViewerSourceType>(
    ViewerSourceType.Channel,
  );
  const handleSourceTypeChange = React.useCallback(
    (_e, value: string) => {
      setSourceType(value as ViewerSourceType);
    },
    [sourceType],
  );

  const [sourceId, setSourceId] = React.useState('');

  React.useEffect(() => {
    if (props.device.playingContent) {
      if (props.device.playingContent.__typename === 'Channel') {
        setSourceType(ViewerSourceType.Channel);
        setSourceId(props.device.playingContent.channelId);
      } else if (
        props.device.playingContent.__typename === 'FileSource' ||
        props.device.playingContent.__typename === 'RecordSource'
      ) {
        setSourceType(ViewerSourceType.Source);
        setSourceId(props.device.playingContent.id);
      }
    }
  }, [props.device]);

  const filterItem = (
    value: GetSourcesSimpleQuery['sourceList']['sources'][0],
  ) => value.status === TranscodeStatus.Success;

  const dispatchPlay = React.useCallback(() => {
    props.onDispatch({
      type: ViewerRequestType.Play,
      sourceType,
      sourceId,
    });
  }, [sourceType, sourceId, props.onDispatch]);

  const dispatchStop = React.useCallback(() => {
    props.onDispatch({
      type: ViewerRequestType.Stop,
    });
  }, [props.onDispatch]);

  const playing = React.useMemo(
    () => props.device.state === ViewerState.Playing,
    [props.device.state],
  );

  return (
    <Box>
      <Grid container alignItems='flex-end' spacing={2}>
        <Grid item md={3}>
          <FormGroup>
            <FormLabel>ソース</FormLabel>
            <RadioGroup value={sourceType} onChange={handleSourceTypeChange}>
              <FormControlLabel
                value={ViewerSourceType.Channel}
                label='チャンネル'
                control={<Radio />}
              />
              <FormControlLabel
                value={ViewerSourceType.Source}
                label='ファイル/録画'
                control={<Radio />}
              />
            </RadioGroup>
          </FormGroup>
        </Grid>
        <Grid item>
          {sourceType === ViewerSourceType.Channel ? (
            <ChannelSelect value={sourceId} handleChange={setSourceId} />
          ) : (
            <SourceSelect
              value={sourceId}
              handleChange={setSourceId}
              filterItem={filterItem}
            />
          )}
        </Grid>
        <Grid item md={4}>
          <ButtonGroup>
            <Button
              variant='contained'
              color='primary'
              size='large'
              onClick={dispatchPlay}
            >
              再生
            </Button>
            <Button
              variant='contained'
              color='secondary'
              size='large'
              onClick={dispatchStop}
              disabled={!playing}
            >
              停止
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      <Typography>{playing ? '再生中' : '停止中'}</Typography>
    </Box>
  );
};
