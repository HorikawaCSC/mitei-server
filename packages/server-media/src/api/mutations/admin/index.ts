import { sourcesMutationResolvers } from './sources';
import { streamingMutationResolvers } from './streaming';

export const adminMutationResolvers = {
  ...sourcesMutationResolvers,
  ...streamingMutationResolvers,
};
