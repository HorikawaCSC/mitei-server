import { GraphQLDateTime } from 'graphql-iso-date';
import { Resolvers } from '../generated/graphql';
import { mutationResolvers } from './mutations';
import { queryResolvers } from './queries';
import { recordSourceResolvers } from './types/record-source';
import { rtmpInputResolvers } from './types/rtmp-input';
import { sourceBaseResolvers } from './types/source-base';

export const resolvers: Resolvers = {
  Date: GraphQLDateTime,
  Mutation: mutationResolvers,
  Query: queryResolvers,
  SourceBase: sourceBaseResolvers,
  FileSource: sourceBaseResolvers,
  RtmpInput: rtmpInputResolvers,
  RecordSource: recordSourceResolvers,
};
