import { QueryResolvers } from '../../generated/graphql';
import { presetQueryResolvers } from './presets';
import { sourcesQueryResolvers } from './sources';
import { streamingQueryResolvers } from './streaming';
import { usersQueryResolver } from './users';

export const queryResolvers: QueryResolvers = {
  ...usersQueryResolver,
  ...sourcesQueryResolvers,
  ...streamingQueryResolvers,
  ...presetQueryResolvers,
};
