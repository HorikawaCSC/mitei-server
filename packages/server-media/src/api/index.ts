import { GraphQLDateTime } from 'graphql-iso-date';
import { Resolvers } from '../generated/graphql';
import { mutationResolvers } from './mutations';
import { queryResolvers } from './queries';
import { channelResolvers } from './types/channel';
import { fileSourceResolvers } from './types/file-source';
import { programResolvers } from './types/program';
import { recordSourceResolvers } from './types/record-source';
import { rtmpInputResolvers } from './types/rtmp-input';
import { scheduleResolvers } from './types/schedule';
import { sourceReferenceResolvers } from './types/source-reference';
import { transcodedSourceResolvers } from './types/transcoded-source';

export const resolvers: Resolvers = {
  Date: GraphQLDateTime,
  Mutation: mutationResolvers,
  Query: queryResolvers,
  TranscodedSource: transcodedSourceResolvers,
  FileSource: fileSourceResolvers,
  RtmpInput: rtmpInputResolvers,
  RecordSource: recordSourceResolvers,
  Channel: channelResolvers,
  SourceReference: sourceReferenceResolvers,
  Schedule: scheduleResolvers,
  Program: programResolvers,
};
