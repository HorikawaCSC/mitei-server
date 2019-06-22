import { GraphQLDateTime } from 'graphql-iso-date';
import { Resolvers } from '../generated/graphql';
import { mutationResolvers } from './mutations';

export const resolvers: Resolvers = {
  Date: GraphQLDateTime,
  Mutation: mutationResolvers,
};
