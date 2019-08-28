import { createContext } from 'react';

type ViewerInfo = {
  id: string;
  displayName: string;
};
const context = createContext<ViewerInfo>({ id: '', displayName: '' });

export const ViewerInfoProvider = context.Provider;
export const ViewerInfoConsumer = context.Consumer;
