import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { CheckBoxOutlined, DesktopAccessDisabled } from '@material-ui/icons';
import clsx from 'clsx';
import * as React from 'react';

const useStyles = makeStyles({
  common: {
    display: 'flex',
  },
  online: {
    color: 'rgba(0, 255, 0, .8)',
  },
  offline: {
    color: 'rgba(255, 0, 0, .8)',
  },
});
export const OnlineBadge = ({ online }: { online: boolean }) => {
  const styles = useStyles();
  if (online) {
    return (
      <Box className={clsx(styles.common, styles.online)}>
        <CheckBoxOutlined />
        <Typography>オンライン</Typography>
      </Box>
    );
  } else {
    return (
      <Box className={clsx(styles.common, styles.offline)}>
        <DesktopAccessDisabled />
        <Typography>オフライン</Typography>
      </Box>
    );
  }
};
