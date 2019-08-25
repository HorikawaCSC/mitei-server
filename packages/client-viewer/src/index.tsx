import { ApolloProvider } from '@apollo/react-common';
import { MuiThemeProvider } from '@material-ui/core/styles';
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
          <BrowserRouter>
            <Root />
          </BrowserRouter>
        </MessageProvider>
      </ApolloProvider>
    </MuiThemeProvider>,
    target,
  );
}
