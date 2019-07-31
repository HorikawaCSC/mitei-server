import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@material-ui/core';
import * as React from 'react';

type ErrorDialogContextType = {
  isOpen: boolean;
  errors: string[];
  open: (...err: string[]) => void;
  close: () => void;
};

const errorDialogContext = React.createContext<ErrorDialogContextType>({
  isOpen: false,
  errors: [],
  open: _err => {},
  close: () => {},
});

export const ErrorDialogContextProvider: React.SFC = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const contextValue: ErrorDialogContextType = React.useMemo(
    () => ({
      isOpen: open,
      open: (...err) => {
        console.log(err);
        setErrors(err);
        setOpen(true);
      },
      close: () => setOpen(false),
      errors,
    }),
    [open, errors],
  );

  return (
    <errorDialogContext.Provider value={contextValue}>
      {children}
    </errorDialogContext.Provider>
  );
};

export const useErrorDialog = () => {
  const contextValue = React.useContext(errorDialogContext);
  return contextValue.open;
};

export const ErrorDialogView = () => {
  const contextValue = React.useContext(errorDialogContext);

  const handleClose = () => {
    contextValue.close();
  };

  return (
    <Dialog open={contextValue.isOpen} onClose={handleClose}>
      <DialogTitle>エラー</DialogTitle>
      <DialogContent>
        {contextValue.errors.map((text, i) => (
          <Typography key={i}>{text}</Typography>
        ))}
      </DialogContent>
      <DialogActions>
        <Button color='primary' onClick={handleClose}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};
