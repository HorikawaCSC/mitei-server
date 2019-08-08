import { MutationResolvers } from '../../../../generated/graphql';
import { channelMutationResolvers } from './channel';
import { programMutationResolvers } from './program';
import { scheduleMutationResolvers } from './schedule';

export const streamingMutationResolvers: MutationResolvers = {
  ...channelMutationResolvers,
  ...scheduleMutationResolvers,
  ...programMutationResolvers,
};
