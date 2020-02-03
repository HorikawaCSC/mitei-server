import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { NotFoundView } from '@mitei/client-common';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  useGetViewerDevicesQuery,
  ViewerState,
} from '../../../api/generated/graphql';

export const ViewerAllList = () => {
  const { error, data, loading } = useGetViewerDevicesQuery({
    fetchPolicy: 'no-cache',
    variables: {
      skip: 0,
      take: 10,
    },
  });

  if (loading) return <CircularProgress />;

  if (!data || !data.viewerDevices || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { total, devices } = data.viewerDevices;
  return (
    <>
      <Typography>{total} 件</Typography>
      <List>
        {devices
          .sort(a => (a.online ? -1 : 1))
          .map(device => {
            return (
              <ListItem
                key={device.id}
                button
                component={Link}
                to={`/viewers/-/${device.id}`}
              >
                <ListItemText
                  primary={device.displayName}
                  secondary={
                    device.online
                      ? device.state === ViewerState.Playing
                        ? 'オンライン - 再生中'
                        : 'オンライン - 停止中'
                      : 'オフライン'
                  }
                />
              </ListItem>
            );
          })}
      </List>
    </>
  );
};
