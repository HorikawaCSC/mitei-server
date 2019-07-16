import { MutationResolvers } from '../../../../generated/graphql';
import { channelMutationResolvers } from './channel';
import { scheduleMutationResolvers } from './schedule';

export const streamingMutationResolvers: MutationResolvers = {
  ...channelMutationResolvers,
  ...scheduleMutationResolvers,
};
