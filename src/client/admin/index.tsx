import { MuiThemeProvider } from '@material-ui/core/styles';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { apolloClient } from '../utils/gql-client';
import { ErrorSnackContextProvider } from './components/shared/ErrorSnackbar';
import { theme } from './styles/theme';
import { Root } from './views/root';

const target = document.querySelector('main');

if (target) {
  render(
    <MuiThemeProvider theme={theme}>
      <ApolloProvider client={apolloClient}>
        <ApolloHooksProvider client={apolloClient}>
          <ErrorSnackContextProvider>
            <BrowserRouter basename='/admin'>
              <Root />
            </BrowserRouter>
          </ErrorSnackContextProvider>
        </ApolloHooksProvider>
      </ApolloProvider>
    </MuiThemeProvider>,
    target,
  );
}
