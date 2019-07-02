import { QueryResolvers } from '../../generated/graphql';
import { sourcesQueryResolvers } from './sources';
import { usersQueryResolver } from './users';

export const queryResolvers: QueryResolvers = {
  ...usersQueryResolver,
  ...sourcesQueryResolvers,
};
