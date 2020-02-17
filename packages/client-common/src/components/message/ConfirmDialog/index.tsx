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
import * as React from 'react';

type CallbackType = (result: boolean) => void;
type ConfirmDialogContextType = {
  isOpen: boolean;
  title: React.ReactNode;
  content: React.ReactNode;
  open: (
    title: React.ReactNode,
    content: React.ReactNode,
    callback: CallbackType,
  ) => void;
  close: (result: boolean) => void;
};

const confirmDialogContext = React.createContext<ConfirmDialogContextType>({
  isOpen: false,
  title: null,
  content: null,
  open: () => {},
  close: () => {},
});

export const ConfirmDialogContextProvider: React.SFC = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const [content, setContent] = React.useState<React.ReactNode>(null);
  const [title, setTitle] = React.useState<React.ReactNode>(null);
  const callbackRef = React.useRef<CallbackType>(() => {});

  const contextValue: ConfirmDialogContextType = {
    isOpen: open,
    open: (title, content, callback) => {
      setTitle(title);
      setContent(content);
      callbackRef.current = callback;
      setOpen(true);
    },
    close: result => {
      callbackRef.current(result);
      setOpen(false);
    },
    content,
    title,
  };
  return (
    <confirmDialogContext.Provider value={contextValue}>
      {children}
    </confirmDialogContext.Provider>
  );
};

export const useConfirmDialog = () => {
  const contextValue = React.useContext(confirmDialogContext);
  return (title: React.ReactNode, content: React.ReactNode) => {
    return new Promise<boolean>(resolve => {
      contextValue.open(title, content, val => resolve(val));
    });
  };
};

export const ConfirmDialogView = () => {
  const contextValue = React.useContext(confirmDialogContext);

  const handleOK = () => {
    contextValue.close(true);
  };
  const handleClose = () => {
    contextValue.close(false);
  };

  return (
    <Dialog open={contextValue.isOpen} onClose={handleClose} fullWidth>
      <DialogTitle>{contextValue.title}</DialogTitle>
      <DialogContent>{contextValue.content}</DialogContent>
      <DialogActions>
        <Button color='primary' onClick={handleClose}>
          キャンセル
        </Button>
        <Button color='primary' onClick={handleOK}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};
