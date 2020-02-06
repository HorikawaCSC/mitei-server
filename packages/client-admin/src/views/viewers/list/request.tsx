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

import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Done } from '@material-ui/icons';
import { NotFoundView, useMessageSnack } from '@mitei/client-common';
import * as React from 'react';
import {
  useAcceptViewerRegistMutation,
  useGetViewerRegistQuery,
  useViewerRequestUpdateSubscription,
} from '../../../api/generated/graphql';
import { HeadTitle } from '../../../components/shared/HeadTitle';

export const ViewerRequestList = () => {
  const { data, error, loading, refetch } = useGetViewerRegistQuery({
    fetchPolicy: 'no-cache',
  });
  const { data: viewerPolling } = useViewerRequestUpdateSubscription();
  const [acceptRequest] = useAcceptViewerRegistMutation();
  const showMessage = useMessageSnack();

  const createAcceptRequestHandler = (id: string) => async () => {
    await acceptRequest({ variables: { id } });
    showMessage('承認されました');
    await refetch();
  };

  React.useEffect(() => {
    if (viewerPolling && viewerPolling.viewerRequestsPolling > 0) {
      refetch();
    }
  }, [viewerPolling]);
  if (loading) return <CircularProgress />;
  if (!data || !data.viewerRequests || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { viewerRequests } = data;

  return (
    <>
      <HeadTitle title='登録待ちサイネージ一覧' />
      {viewerRequests.length === 0 ? (
        <Typography>登録待ち端末はありません</Typography>
      ) : (
        <List>
          {viewerRequests.map(request => (
            <ListItem key={request.id}>
              <ListItemText primary={`コード: ${request.code}`} />
              <ListItemSecondaryAction>
                <IconButton
                  edge='end'
                  onClick={createAcceptRequestHandler(request.id)}
                >
                  <Done />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
};
