import { GraphQLDateTime } from 'graphql-iso-date';
import { Resolvers } from '../generated/graphql';
import { mutationResolvers } from './mutations';
import { queryResolvers } from './queries';
import { sourceBaseResolvers } from './types/source-base';

export const resolvers: Resolvers = {
  Date: GraphQLDateTime,
  Mutation: mutationResolvers,
  Query: queryResolvers,
  SourceBase: sourceBaseResolvers,
  FileSource: sourceBaseResolvers,
};
