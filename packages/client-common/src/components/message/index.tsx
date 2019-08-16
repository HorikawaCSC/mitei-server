import * as React from 'react';
import {
  ConfirmDialogContextProvider,
  ConfirmDialogView,
} from './ConfirmDialog';
import {
  MessageDialogContextProvider,
  MessageDialogView,
} from './MessageDialog';
import { MessageSnackContextProvider, MessageSnackView } from './MessageSnack';

export const MessageView = () => {
  return (
    <>
      <MessageSnackView />
      <MessageDialogView />
      <ConfirmDialogView />
    </>
  );
};

export const MessageProvider: React.SFC = ({ children }) => {
  return (
    <MessageSnackContextProvider>
      <MessageDialogContextProvider>
        <ConfirmDialogContextProvider>{children}</ConfirmDialogContextProvider>
      </MessageDialogContextProvider>
    </MessageSnackContextProvider>
  );
};
