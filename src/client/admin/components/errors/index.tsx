import * as React from 'react';
import { ErrorDialogContextProvider, ErrorDialogView } from './ErrorDialog';
import { ErrorSnackContextProvider, ErrorSnackView } from './ErrorSnackbar';

export const ErrorsView = () => {
  return (
    <>
      <ErrorSnackView />
      <ErrorDialogView />
    </>
  );
};

export const ErrorsProvider: React.SFC = ({ children }) => {
  return (
    <ErrorSnackContextProvider>
      <ErrorDialogContextProvider>{children}</ErrorDialogContextProvider>
    </ErrorSnackContextProvider>
  );
};
