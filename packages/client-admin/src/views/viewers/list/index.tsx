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

import { Paper, Tab, Tabs } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import {
  Link,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { ViewerAllList } from './all';
import { ViewerRequestList } from './request';

const useStyles = makeStyles(theme =>
  createStyles({
    paper: {
      margin: theme.spacing(1, 0),
    },
  }),
);

const renderTabs = (props: RouteComponentProps<{ type: string }>) => {
  return (
    <Tabs value={props.match.params.type || 'all'}>
      <Tab component={Link} to='/viewers/all' label='登録済み' value='all' />
      <Tab
        component={Link}
        to='/viewers/request'
        label='登録待ち'
        value='request'
      />
    </Tabs>
  );
};

export const ViewersListView = () => {
  const styles = useStyles();

  return (
    <Paper className={styles.paper}>
      <Route path='/viewers/:type?' render={renderTabs} exact />
      <Switch>
        <Route
          path='/viewers'
          render={() => <Redirect to='/viewers/all' />}
          exact
        />
        <Route path='/viewers/all' component={ViewerAllList} exact />
        <Route path='/viewers/request' component={ViewerRequestList} exact />
      </Switch>
    </Paper>
  );
};
