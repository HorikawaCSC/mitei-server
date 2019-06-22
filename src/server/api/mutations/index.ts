import { MutationResolvers } from '../../generated/graphql';
import { adminMutationResolvers } from './admin';

export const mutationResolvers: MutationResolvers = {
  ...adminMutationResolvers,
};
