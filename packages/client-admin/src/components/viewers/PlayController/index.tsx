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

import { ButtonGroup, Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Typography from '@material-ui/core/Typography';
import { Duration } from 'luxon';
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
    'playingContent' | 'state' | 'elapsed'
  >;
};
export const PlayController = (props: Props) => {
  const [sourceType, setSourceType] = React.useState<ViewerSourceType>(
    ViewerSourceType.Channel,
  );
  const [changed, setChanged] = React.useState(false);
  const handleSourceTypeChange = React.useCallback(
    (_e, value: string) => {
      setChanged(true);
      setSourceType(value as ViewerSourceType);
    },
    [sourceType],
  );

  const [sourceId, setSourceId] = React.useState('');
  const handleSourceIdChange = React.useCallback(
    (id: string) => {
      setChanged(true);
      setSourceId(id);
    },
    [sourceId, setChanged],
  );

  React.useEffect(() => {
    if (changed) return;

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
    setChanged(false);
    props.onDispatch({
      type: ViewerRequestType.Play,
      sourceType,
      sourceId,
    });
  }, [sourceType, sourceId, props.onDispatch]);

  const dispatchStop = React.useCallback(() => {
    setChanged(false);
    props.onDispatch({
      type: ViewerRequestType.Stop,
    });
  }, [props.onDispatch]);

  const playing = React.useMemo(
    () => props.device.state === ViewerState.Playing,
    [props.device.state],
  );

  const stateMessage = React.useMemo(() => {
    if (playing) {
      if (props.device.elapsed) {
        return `再生中 ${Duration.fromMillis(
          props.device.elapsed * 1000,
        ).toFormat('hh:mm:ss')}`;
      } else {
        return '再生中';
      }
    } else {
      return '停止';
    }
  }, [playing, props.device, props.device.elapsed]);

  return (
    <Box>
      <Grid container alignItems='flex-end' spacing={2}>
        <Grid item md={3}>
          <FormGroup>
            <FormLabel>ソース{changed && ' 変更あり'}</FormLabel>
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
            <ChannelSelect
              value={sourceId}
              handleChange={handleSourceIdChange}
            />
          ) : (
            <SourceSelect
              value={sourceId}
              handleChange={handleSourceIdChange}
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
              disabled={playing}
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
      <Typography>{stateMessage}</Typography>
    </Box>
  );
};
