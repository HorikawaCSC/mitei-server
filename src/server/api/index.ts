import { GraphQLDateTime } from 'graphql-iso-date';
import { Resolvers } from '../generated/graphql';
import { mutationResolvers } from './mutations';
import { queryResolvers } from './queries';
import { fileSourceResolvers } from './types/file-source';
import { recordSourceResolvers } from './types/record-source';
import { rtmpInputResolvers } from './types/rtmp-input';
import { sourceBaseResolvers } from './types/source-base';

export const resolvers: Resolvers = {
  Date: GraphQLDateTime,
  Mutation: mutationResolvers,
  Query: queryResolvers,
  SourceBase: sourceBaseResolvers,
  FileSource: fileSourceResolvers,
  RtmpInput: rtmpInputResolvers,
  RecordSource: recordSourceResolvers,
};
