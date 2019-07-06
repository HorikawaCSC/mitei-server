import { Paper, Tab, Tabs } from '@material-ui/core';
import * as React from 'react';
import {
  Link,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { FileSourceList } from './file';

const renderTabs = (props: RouteComponentProps<{ type: string }>) => {
  return (
    <Tabs value={props.match.params.type || 'file'}>
      <Tab component={Link} to='/sources/file' label='ファイル' value='file' />
      <Tab
        component={Link}
        to='/sources/recorded'
        label='生放送録画'
        value='recorded'
      />
      <Tab component={Link} to='/sources/rtmp' label='RTMP' value='rtmp' />
    </Tabs>
  );
};

export const SourcesListView = () => {
  return (
    <Paper>
      <Route path='/sources/:type?' render={renderTabs} exact />
      <Switch>
        <Route
          path='/sources'
          render={() => <Redirect to='/sources/file' />}
          exact
        />
        <Route path='/sources/file' component={FileSourceList} exact />
      </Switch>
    </Paper>
  );
};
