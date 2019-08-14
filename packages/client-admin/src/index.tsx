import { MuiThemeProvider } from '@material-ui/core/styles';
import { MessageProvider } from '@mitei/client-common';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { theme } from './styles/theme';
import { apolloClient } from './utils/gql-client';
import { Root } from './views/root';
import LuxonUtils from '@date-io/luxon';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

const target = document.querySelector('main');

if (target) {
  render(
    <MuiThemeProvider theme={theme}>
      <ApolloProvider client={apolloClient}>
        <ApolloHooksProvider client={apolloClient}>
          <MessageProvider>
            <MuiPickersUtilsProvider utils={LuxonUtils}>
              <BrowserRouter>
                <Root />
              </BrowserRouter>
            </MuiPickersUtilsProvider>
          </MessageProvider>
        </ApolloHooksProvider>
      </ApolloProvider>
    </MuiThemeProvider>,
    target,
  );
}
