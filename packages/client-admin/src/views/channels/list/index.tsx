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
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Add } from '@material-ui/icons';
import { NotFoundView, PageContainer } from '@mitei/client-common';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useGetChannelsSimpleQuery } from '../../../api/generated/graphql';
import { AddChannelDialog } from '../../../components/channels/AddChannelDialog';
import { HeadTitle } from '../../../components/shared/HeadTitle';
import { useCommonStyles } from '../../../styles/common';

export const ChannelsListView = () => {
  const {
    data,
    error,
    loading,
    refetch,
    fetchMore,
  } = useGetChannelsSimpleQuery({
    variables: { skip: 0, take: 10 },
    fetchPolicy: 'network-only',
  });
  const commonStyles = useCommonStyles();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [scrollRef, inView] = useInView();

  React.useEffect(() => {
    if (inView && !loading && data) {
      const { channels } = data.channelList;
      fetchMore({
        variables: {
          skip: channels.length,
          take: 10,
        },
        updateQuery(prev, { fetchMoreResult }) {
          if (!fetchMoreResult) return prev;
          return {
            channelList: {
              total: fetchMoreResult.channelList.total,
              channels: [
                ...prev.channelList.channels,
                ...fetchMoreResult.channelList.channels,
              ],
              __typename: prev.channelList.__typename,
            },
          };
        },
      });
    }
  }, [inView]);

  if (loading) return <CircularProgress />;

  if (error || !data) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const handleDialogClose = () => {
    setAddDialogOpen(false);

    refetch();
  };

  const handleDialogOpen = () => {
    setAddDialogOpen(true);
  };

  const { total, channels } = data.channelList;
  const hasMore = total > channels.length;
  return (
    <PageContainer title='チャンネル一覧'>
      <HeadTitle title='チャンネル一覧' />
      <Typography>{total} 件</Typography>
      <List>
        {channels.map(channel => {
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
        {hasMore && <div ref={scrollRef} />}
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
