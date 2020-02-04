/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

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
