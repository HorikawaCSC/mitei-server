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
      return <ChannelPlayer channelId={state.playingContent.channelId} />;
    } else if (
      state.playingContent.__typename === 'FileSource' ||
      state.playingContent.__typename === 'RecordSource'
    ) {
      return <SourcePlayer sourceId={state.playingContent.id} />;
    }
  }

  return <WaitingView />;
};
