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
    'playingContent' | 'state' | 'volume' | 'id' | 'elapsed'
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
