import * as React from 'react';
import {
  useViewerRequestSubscription,
  ViewerRequestType,
} from '../../api/generated/graphql';
import { ChannelPlayer } from '../../components/ChannelPlayer';
import { WaitingView } from '../../components/shared/WaitingView';

export const ViewerRoot = () => {
  const { error, data } = useViewerRequestSubscription();

  if (error) {
    return <p>an error occured: {error.message}</p>;
  }

  if (!data) {
    return <WaitingView />;
  }
  const { type, source } = data.viewerRequest;
  if (type === ViewerRequestType.Play && source) {
    if (source.__typename === 'Channel') {
      return <ChannelPlayer channelId={source.channelId} />;
    }
  }
  return null;
};
