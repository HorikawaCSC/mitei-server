import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import * as React from 'react';
import {
  ViewerRequestParam,
  ViewerStateSingleSubscription,
} from '../../../api/generated/graphql';
import { PlayController } from '../PlayController';
import { VolumeDispatcher } from '../VolumeDispatcher';

type Props = {
  onDispatch: (request: Omit<ViewerRequestParam, 'device'>) => void;
  device: Pick<
    ViewerStateSingleSubscription['viewerUpdateDevice'],
    'playingContent' | 'state' | 'volume' | 'id'
  >;
};
export const Controller = (props: Props) => {
  return (
    <Box>
      <Typography variant='h6'>操作</Typography>
      <PlayController onDispatch={props.onDispatch} device={props.device} />
      <hr />
      <VolumeDispatcher onDispatch={props.onDispatch} device={props.device} />
    </Box>
  );
};
