import { QueryResolvers } from '../../../generated/graphql';
import { viewerRegistrationQueryResolvers } from './registration';

export const viewerQueryResolvers: QueryResolvers = {
  ...viewerRegistrationQueryResolvers,
};
