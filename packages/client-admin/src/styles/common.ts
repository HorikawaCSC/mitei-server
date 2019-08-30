import { makeStyles } from '@material-ui/core';
import { theme } from './theme';

export const useCommonStyles = makeStyles({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },
  centerBox: {
    display: 'flex',
    alignItems: 'center',
  },
});
