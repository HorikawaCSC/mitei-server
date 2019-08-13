import * as React from 'react';
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
    </>
  );
};

export const MessageProvider: React.SFC = ({ children }) => {
  return (
    <MessageSnackContextProvider>
      <MessageDialogContextProvider>{children}</MessageDialogContextProvider>
    </MessageSnackContextProvider>
  );
};
