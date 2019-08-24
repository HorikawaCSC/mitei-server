import { MutationResolvers } from '../../../generated/graphql';
import { viewerRegistrationMutationResolvers } from './registration';
import { viewerRequestMutationResolvers } from './request';

export const viewerMutationResolvers: MutationResolvers = {
  ...viewerRegistrationMutationResolvers,
  ...viewerRequestMutationResolvers,
};
