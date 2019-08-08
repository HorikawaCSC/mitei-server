import { Container, CssBaseline } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { ErrorsView, FullscreenProgress } from '@mitei/client-common';
import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useGetMyselfSimpleQuery } from '../../api/generated/graphql';
import { HeaderMenu } from '../../components/shared/HeaderMenu';
import { ChannelsRoot } from '../channels';
import { LoginView } from '../login';
import { SourcesRoot } from '../sources';

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
        </Switch>
      </Container>
      <ErrorsView />
    </>
  );
};
