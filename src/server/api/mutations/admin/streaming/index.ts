import { MutationResolvers } from '../../../../generated/graphql';
import { channelMutationResolvers } from './channel';

export const streamingMutationResolvers: MutationResolvers = {
  ...channelMutationResolvers,
};
