import { ApolloProvider } from '@apollo/react-common';
import LuxonUtils from '@date-io/luxon';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MessageProvider } from '@mitei/client-common';
import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { theme } from './styles/theme';
import { apolloClient } from './utils/gql-client';
import { Root } from './views/root';

const target = document.querySelector('main');

if (target) {
  render(
    <MuiThemeProvider theme={theme}>
      <ApolloProvider client={apolloClient}>
        <MessageProvider>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <BrowserRouter basename='/admin'>
              <Root />
            </BrowserRouter>
          </MuiPickersUtilsProvider>
        </MessageProvider>
      </ApolloProvider>
    </MuiThemeProvider>,
    target,
  );
}
