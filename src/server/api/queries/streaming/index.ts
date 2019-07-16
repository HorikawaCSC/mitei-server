import { QueryResolvers } from '../../../generated/graphql';
import { channelQueryResolvers } from './channel';

export const streamingQueryResolvers: QueryResolvers = {
  ...channelQueryResolvers,
};
