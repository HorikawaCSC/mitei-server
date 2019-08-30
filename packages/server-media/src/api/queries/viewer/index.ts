import { QueryResolvers } from '../../../generated/graphql';
import { viewerListQueryResolvers } from './list';
import { viewerRegistrationQueryResolvers } from './registration';

export const viewerQueryResolvers: QueryResolvers = {
  ...viewerRegistrationQueryResolvers,
  ...viewerListQueryResolvers,
};
