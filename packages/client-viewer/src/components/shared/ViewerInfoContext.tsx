import { createContext } from 'react';
import { GetViewerInfoQuery } from '../../api/generated/graphql';

const context = createContext<GetViewerInfoQuery['viewerInfo'] | null>(null);

export const ViewerInfoContext = context;
export const ViewerInfoProvider = context.Provider;
export const ViewerInfoConsumer = context.Consumer;
