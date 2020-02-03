import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';

const useStyles = makeStyles({
  total: {
    paddingLeft: 16,
    paddingTop: 8,
  },
});
export const TotalCount = ({ count }: { count: number }) => {
  const styles = useStyles();

  return <Typography className={styles.total}>{count}件</Typography>;
};
