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

import { Container, CssBaseline } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FullscreenProgress, MessageView } from '@mitei/client-common';
import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useGetMyselfSimpleQuery } from '../../api/generated/graphql';
import { HeaderMenu } from '../../components/shared/HeaderMenu';
import { ChannelsRoot } from '../channels';
import { LoginView } from '../login';
import { PresetsList } from '../presets';
import { ScheduleRoot } from '../schedules';
import { SourcesRoot } from '../sources';
import { UsersRoot } from '../users';
import { ViewersRoot } from '../viewers';
import { NotifyRealtime } from './notify';

const useStyles = makeStyles({
  content: {
    marginTop: '75px',
  },
});

export const Root = () => {
  const styles = useStyles();
  const { loading, data, error } = useGetMyselfSimpleQuery();

  if (loading) return <FullscreenProgress />;
  if (error) return <p>error</p>;

  if (!data || !data.me || data.me.kind !== 'admin') {
    return (
      <>
        <CssBaseline />
        <Container fixed>
          <Switch>
            <Route path='/login' component={LoginView} exact />
            <Route render={() => <Redirect to='/login' />} />
          </Switch>
        </Container>
      </>
    );
  }

  return (
    <>
      <CssBaseline />
      <HeaderMenu />
      <Container fixed className={styles.content}>
        <Switch>
          <Route path='/sources' component={SourcesRoot} />
          <Route path='/channels' component={ChannelsRoot} />
          <Route path='/schedules' component={ScheduleRoot} />
          <Route path='/presets' component={PresetsList} />
          <Route path='/viewers' component={ViewersRoot} />
          <Route path='/users' component={UsersRoot} />
        </Switch>
      </Container>
      <NotifyRealtime />
      <MessageView />
    </>
  );
};
