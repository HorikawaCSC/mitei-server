import { GraphQLDateTime } from 'graphql-iso-date';
import { Resolvers } from '../generated/graphql';
import { mutationResolvers } from './mutations';
import { queryResolvers } from './queries';
import { fileSourceResolvers } from './types/file-source';
import { recordSourceResolvers } from './types/record-source';
import { rtmpInputResolvers } from './types/rtmp-input';
import { transcodedSourceResolvers } from './types/transcoded-source';

export const resolvers: Resolvers = {
  Date: GraphQLDateTime,
  Mutation: mutationResolvers,
  Query: queryResolvers,
  TranscodedSource: transcodedSourceResolvers,
  FileSource: fileSourceResolvers,
  RtmpInput: rtmpInputResolvers,
  RecordSource: recordSourceResolvers,
};
