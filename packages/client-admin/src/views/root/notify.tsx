import { useMessageSnack } from '@mitei/client-common';
import * as React from 'react';
import { useViewerRequestUpdateSubscription } from '../../api/generated/graphql';

export const NotifyRealtime = () => {
  const { data: viewerPolling } = useViewerRequestUpdateSubscription();
  const showMessage = useMessageSnack();

  React.useEffect(() => {
    if (viewerPolling && viewerPolling.viewerRequestsPolling > 0) {
      showMessage('新しい登録待ち端末があります');
    }
  }, [viewerPolling]);

  return null;
};
