import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Clear, Done } from '@material-ui/icons';
import { NotFoundView } from '@mitei/client-common';
import * as React from 'react';
import {
  useAcceptViewerRegistMutation,
  useGetViewerRegistQuery,
} from '../../../api/generated/graphql';

export const ViewerRequestList = () => {
  const { data, error, loading, refetch } = useGetViewerRegistQuery({
    fetchPolicy: 'no-cache',
  });

  const [acceptRequest] = useAcceptViewerRegistMutation();

  const createAcceptRequestHandler = (id: string) => async () => {
    await acceptRequest({ variables: { id } });
    await refetch();
  };

  if (loading) return <CircularProgress />;
  if (!data || !data.viewerRequests || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { viewerRequests } = data;

  if (viewerRequests.length === 0) {
    return <Typography>登録待ち端末はありません</Typography>;
  }

  return (
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
            <IconButton edge='end'>
              <Clear />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};
