import { MutationResolvers } from '../../../generated/graphql';
import { viewerRegistrationMutationResolvers } from './registration';

export const viewerMutationResolvers: MutationResolvers = {
  ...viewerRegistrationMutationResolvers,
};
