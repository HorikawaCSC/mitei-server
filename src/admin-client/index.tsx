import { MuiThemeProvider } from '@material-ui/core/styles';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { apolloClient } from '../client/utils/gql-client';
import { ErrorsProvider } from './components/errors';
import { theme } from './styles/theme';
import { Root } from './views/root';

const target = document.querySelector('main');

if (target) {
  render(
    <MuiThemeProvider theme={theme}>
      <ApolloProvider client={apolloClient}>
        <ApolloHooksProvider client={apolloClient}>
          <ErrorsProvider>
            <BrowserRouter basename='/admin'>
              <Root />
            </BrowserRouter>
          </ErrorsProvider>
        </ApolloHooksProvider>
      </ApolloProvider>
    </MuiThemeProvider>,
    target,
  );
}
