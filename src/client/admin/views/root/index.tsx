import { Container, CssBaseline } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { HeaderMenu } from '../../components/HeaderMenu';
import { theme } from '../../styles/theme';

const useStyles = makeStyles({
  content: {
    marginTop: '75px',
  },
});

export const Root = () => {
  const styles = useStyles();
  return (
    <MuiThemeProvider theme={theme}>
      <BrowserRouter basename='/admin'>
        <CssBaseline />
        <HeaderMenu />
        <Container fixed className={styles.content}>
          <Switch>
          </Switch>
        </Container>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};
