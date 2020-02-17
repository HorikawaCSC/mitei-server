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

import * as React from 'react';
import {
  useViewerUpdateSubscription,
  ViewerState,
} from '../../api/generated/graphql';
import { ChannelPlayer } from '../../components/ChannelPlayer';
import { ViewerInfoContext } from '../../components/shared/ViewerInfoContext';
import { WaitingView } from '../../components/shared/WaitingView';
import { SourcePlayer } from '../../components/SourcePlayer';

export const ViewerRoot = () => {
  const initialDevice = React.useContext(ViewerInfoContext);
  const {
    error: realtimeError,
    data: realtimeData,
  } = useViewerUpdateSubscription();

  const state = React.useMemo(
    () => (realtimeData ? realtimeData.viewerUpdate : initialDevice),
    [realtimeData, initialDevice],
  );

  if (realtimeError) {
    return <p>an error occured while polling: {realtimeError.message}</p>;
  }

  if (!state) {
    return <WaitingView />;
  }

  if (state.state === ViewerState.Playing && state.playingContent) {
    if (state.playingContent.__typename === 'Channel') {
      return (
        <ChannelPlayer
          channelId={state.playingContent.channelId}
          volume={state.volume / 100}
        />
      );
    } else if (
      state.playingContent.__typename === 'FileSource' ||
      state.playingContent.__typename === 'RecordSource'
    ) {
      return (
        <SourcePlayer
          sourceId={state.playingContent.id}
          volume={state.volume / 100}
        />
      );
    }
  }

  return <WaitingView />;
};
