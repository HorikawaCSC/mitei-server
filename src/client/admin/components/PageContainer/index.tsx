import { makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import * as React from 'react';

export const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(3, 2),
  },
}));


type Props = {
  title: string;
};

export const PageContainer: React.SFC<Props> = ({ title, children }) => {
  const styles = useStyles();
  return (
    <Paper className={styles.paper}>
      <Typography component='h3' variant='h5'>
        {title}
      </Typography>
      {children}
    </Paper>
  );
};
