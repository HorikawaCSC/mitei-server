import { createStyles, makeStyles, Theme } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import { Close } from '@material-ui/icons';
import * as React from 'react';

type ErrorSnackContextType = {
  isOpen: boolean;
  text: string;
  open: (err: string) => void;
  close: () => void;
};

const errorSnackContext = React.createContext<ErrorSnackContextType>({
  isOpen: false,
  text: '',
  open: _err => {},
  close: () => {},
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    close: {
      padding: theme.spacing(0.5),
    },
  }),
);

export const ErrorSnackContextProvider: React.SFC = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const contextValue: ErrorSnackContextType = React.useMemo(
    () => ({
      isOpen: open,
      open: err => {
        console.log(err);
        setErrorMsg(err);
        setOpen(true);
      },
      close: () => setOpen(false),
      text: errorMsg,
    }),
    [open, errorMsg],
  );

  return (
    <errorSnackContext.Provider value={contextValue}>
      {children}
    </errorSnackContext.Provider>
  );
};

export const useErrorSnack = () => {
  const contextValue = React.useContext(errorSnackContext);
  return contextValue.open;
};

export const ErrorSnackView = () => {
  const contextValue = React.useContext(errorSnackContext);
  const styles = useStyles();

  const handleClose = () => {
    contextValue.close();
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      open={contextValue.isOpen}
      autoHideDuration={6000}
      onClose={handleClose}
      message={contextValue.text}
      action={[
        <IconButton
          color='inherit'
          className={styles.close}
          onClick={handleClose}
        >
          <Close />
        </IconButton>,
      ]}
    />
  );
};
