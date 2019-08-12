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
import { FileSourceList } from './file';
import { RecordSourceList } from './record';
import { RtmpInputList } from './rtmp';

const useStyles = makeStyles(theme =>
  createStyles({
    paper: {
      margin: theme.spacing(1, 0),
    },
  }),
);

const renderTabs = (props: RouteComponentProps<{ type: string }>) => {
  return (
    <Tabs value={props.match.params.type || 'file'}>
      <Tab component={Link} to='/sources/file' label='ファイル' value='file' />
      <Tab
        component={Link}
        to='/sources/record'
        label='生放送録画'
        value='record'
      />
      <Tab component={Link} to='/sources/rtmp' label='RTMP' value='rtmp' />
    </Tabs>
  );
};

export const SourcesListView = () => {
  const styles = useStyles();

  return (
    <Paper className={styles.paper}>
      <Route path='/sources/:type?' render={renderTabs} exact />
      <Switch>
        <Route
          path='/sources'
          render={() => <Redirect to='/sources/file' />}
          exact
        />
        <Route path='/sources/file' component={FileSourceList} exact />
        <Route path='/sources/rtmp' component={RtmpInputList} exact />
        <Route path='/sources/record' component={RecordSourceList} exact />
      </Switch>
    </Paper>
  );
};
