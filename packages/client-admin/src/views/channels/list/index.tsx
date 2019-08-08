import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Add } from '@material-ui/icons';
import { PageContainer, useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { useGetChannelsSimpleQuery } from '../../../api/generated/graphql';
import { AddChannelDialog } from '../../../components/channels/AddChannelDialog';
import { useCommonStyles } from '../../../styles/common';

export const ChannelsListView = () => {
  const { data, error, loading, refetch } = useGetChannelsSimpleQuery({
    errorPolicy: 'all',
    variables: { skip: 0, take: 10 },
  });
  const openErrorMessage = useErrorSnack();
  const commonStyles = useCommonStyles();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);

  if (loading) return <CircularProgress />;

  if (error || !data || !data.channelList) {
    openErrorMessage(error ? error.message : '一覧の取得に失敗');
    return null;
  }

  const handleDialogClose = () => {
    setAddDialogOpen(false);

    refetch();
  };

  const handleDialogOpen = () => {
    setAddDialogOpen(true);
  };

  return (
    <PageContainer title='チャンネル一覧'>
      <Typography>{data.channelList.total} 件</Typography>
      <List>
        {data.channelList.channels.map(channel => {
          return (
            <ListItem
              key={channel.id}
              button
              component={Link}
              to={`/channels/${channel.id}`}
            >
              <ListItemText
                primary={channel.displayName}
                secondary={`ID: ${channel.id}`}
              />
            </ListItem>
          );
        })}
      </List>
      <AddChannelDialog open={addDialogOpen} handleClose={handleDialogClose} />
      <Fab
        className={commonStyles.fab}
        color='primary'
        onClick={handleDialogOpen}
      >
        <Add />
      </Fab>
    </PageContainer>
  );
};
