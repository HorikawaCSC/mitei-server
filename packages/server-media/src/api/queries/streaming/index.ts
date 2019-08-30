import { QueryResolvers } from '../../../generated/graphql';
import { channelQueryResolvers } from './channel';
import { scheduleQueryResolvers } from './schedule';

export const streamingQueryResolvers: QueryResolvers = {
  ...channelQueryResolvers,
  ...scheduleQueryResolvers,
};
