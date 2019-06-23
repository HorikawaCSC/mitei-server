import { Container, CssBaseline } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo-hooks';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { apolloClient } from '../../../utils/gql-client';
import { HeaderMenu } from '../../components/HeaderMenu';
import { theme } from '../../styles/theme';
import { SourcesUpload } from '../sources/upload';

const useStyles = makeStyles({
  content: {
    marginTop: '75px',
  },
});

export const Root = () => {
  const styles = useStyles();
  return (
    <MuiThemeProvider theme={theme}>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter basename='/admin'>
          <CssBaseline />
          <HeaderMenu />
          <Container fixed className={styles.content}>
            <Switch>
              <Route path='/sources/upload' component={SourcesUpload} exact />
            </Switch>
          </Container>
        </BrowserRouter>
      </ApolloProvider>
    </MuiThemeProvider>
  );
};
