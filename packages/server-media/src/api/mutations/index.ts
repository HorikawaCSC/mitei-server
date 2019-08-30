import { MutationResolvers } from '../../generated/graphql';
import { adminMutationResolvers } from './admin';
import { viewerMutationResolvers } from './viewer';

export const mutationResolvers: MutationResolvers = {
  ...adminMutationResolvers,
  ...viewerMutationResolvers,
};
