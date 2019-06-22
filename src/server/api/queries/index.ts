import { QueryResolvers } from '../../generated/graphql';
import { usersQueryResolver } from './users';

export const queryResolvers: QueryResolvers = {
  ...usersQueryResolver,
};
