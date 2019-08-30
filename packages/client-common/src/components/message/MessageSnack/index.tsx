import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Close } from '@material-ui/icons';
import * as React from 'react';

type MessageSnackContextType = {
  isOpen: boolean;
  text: string;
  open: (msg: string) => void;
  close: () => void;
};

const messageSnackContext = React.createContext<MessageSnackContextType>({
  isOpen: false,
  text: '',
  open: _msg => {},
  close: () => {},
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    close: {
      padding: theme.spacing(0.5),
    },
  }),
);

export const MessageSnackContextProvider: React.SFC = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const contextValue: MessageSnackContextType = React.useMemo(
    () => ({
      isOpen: open,
      open: message => {
        setMessage(message);
        setOpen(true);
      },
      close: () => setOpen(false),
      text: message,
    }),
    [open, message],
  );

  return (
    <messageSnackContext.Provider value={contextValue}>
      {children}
    </messageSnackContext.Provider>
  );
};

export const useMessageSnack = () => {
  const contextValue = React.useContext(messageSnackContext);
  return contextValue.open;
};

export const MessageSnackView = () => {
  const contextValue = React.useContext(messageSnackContext);
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
          key='close'
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
