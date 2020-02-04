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

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';

type MessageDialogContextType = {
  isOpen: boolean;
  title: string;
  messages: string[];
  open: (title: string, ...err: string[]) => void;
  close: () => void;
};

const messageDialogContext = React.createContext<MessageDialogContextType>({
  isOpen: false,
  title: '',
  messages: [],
  open: _param => {},
  close: () => {},
});

export const MessageDialogContextProvider: React.SFC = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<string[]>([]);
  const [title, setTitle] = React.useState<string>('');

  const contextValue: MessageDialogContextType = React.useMemo(
    () => ({
      isOpen: open,
      open: (title, ...err) => {
        setTitle(title);
        setMessages(err);
        setOpen(true);
      },
      close: () => setOpen(false),
      messages,
      title,
    }),
    [open, messages, title],
  );

  return (
    <messageDialogContext.Provider value={contextValue}>
      {children}
    </messageDialogContext.Provider>
  );
};

export const useMessageDialog = () => {
  const contextValue = React.useContext(messageDialogContext);
  return contextValue.open;
};

export const MessageDialogView = () => {
  const contextValue = React.useContext(messageDialogContext);

  const handleClose = () => {
    contextValue.close();
  };

  return (
    <Dialog open={contextValue.isOpen} onClose={handleClose}>
      <DialogTitle>{contextValue.title}</DialogTitle>
      <DialogContent>
        {contextValue.messages.map((text, i) => (
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
