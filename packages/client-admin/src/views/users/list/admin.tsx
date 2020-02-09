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

import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { AccountCircle, Delete } from '@material-ui/icons';
import { NotFoundView, PageContainer } from '@mitei/client-common';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { useGetAdminUsersQuery } from '../../../api/generated/graphql';
import { HeadTitle } from '../../../components/shared/HeadTitle';
import { TotalCount } from '../../../components/shared/TotalCount';

export const AdminUsersList = () => {
  const { data, error, loading, fetchMore } = useGetAdminUsersQuery({
    variables: {
      skip: 0,
      take: 10,
    },
  });
  const [scrollRef, inView] = useInView();

  React.useEffect(() => {
    if (inView && !loading && data) {
      const { users } = data.users;
      fetchMore({
        variables: {
          skip: users.length,
          take: 10,
        },
        updateQuery(prev, { fetchMoreResult }) {
          if (!fetchMoreResult) return prev;
          return {
            users: {
              total: fetchMoreResult.users.total,
              users: [...prev.users.users, ...fetchMoreResult.users.users],
              __typename: prev.users.__typename,
            },
          };
        },
      });
    }
  }, [inView]);

  if (loading) return <CircularProgress />;

  if (!data || !data.users || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { total, users } = data.users;
  const hasMore = total > users.length;
  return (
    <>
      <HeadTitle title='管理ユーザ一覧' />
      <PageContainer title='管理ユーザ一覧'>
        <TotalCount count={total} />
        <List>
          {users.map(user => {
            return (
              <ListItem key={user.id}>
                <ListItemAvatar>
                  {user.iconUrl ? (
                    <Avatar alt={user.screenName} src={user.iconUrl} />
                  ) : (
                    <Avatar>
                      <AccountCircle />
                    </Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={user.screenName}
                  secondary={`IDP: ${user.type}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge='end'>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        {hasMore && <div ref={scrollRef} />}
      </PageContainer>
    </>
  );
};
