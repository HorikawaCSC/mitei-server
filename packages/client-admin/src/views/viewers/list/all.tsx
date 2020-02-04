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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { NotFoundView } from '@mitei/client-common';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  useGetViewerDevicesQuery,
  ViewerState,
} from '../../../api/generated/graphql';
import { TotalCount } from '../../../components/shared/TotalCount';

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
      <TotalCount count={total} />
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
