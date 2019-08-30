import { makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import * as React from 'react';

export const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 0),
  },
}));

type Props = {
  title: string;
  mini?: boolean;
};

export const PageContainer: React.SFC<Props> = ({ title, children, mini }) => {
  const styles = useStyles();
  return (
    <Paper className={styles.paper}>
      <Typography component={mini ? 'h6' : 'h5'} variant={mini ? 'h6' : 'h5'}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
};
