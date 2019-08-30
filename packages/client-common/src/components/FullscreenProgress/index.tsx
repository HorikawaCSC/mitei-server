import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';

const useStyles = makeStyles({
  background: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const FullscreenProgress = () => {
  const styles = useStyles();

  return (
    <Box className={styles.background}>
      <CircularProgress />
    </Box>
  );
};
