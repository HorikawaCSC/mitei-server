import { GraphQLDateTime } from 'graphql-iso-date';
import { Resolvers } from '../generated/graphql';
import { mutationResolvers } from './mutations';
import { queryResolvers } from './queries';
import { subscriptionResolvers } from './subscriptions';
import { channelResolvers } from './types/channel';
import { fileSourceResolvers } from './types/file-source';
import { playbackableResolvers } from './types/playbackable';
import { programResolvers } from './types/program';
import { recordSourceResolvers } from './types/record-source';
import { rtmpInputResolvers } from './types/rtmp-input';
import { scheduleResolvers } from './types/schedule';
import { sourceReferenceResolvers } from './types/source-reference';
import { transcodedSourceResolvers } from './types/transcoded-source';
import { viewerDeviceResolvers } from './types/viewer-device';
import { viewerRequestResolvers } from './types/viewer-request';

export const resolvers: Resolvers = {
  DateTime: GraphQLDateTime,
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
  Subscription: subscriptionResolvers,
  ViewerRequest: viewerRequestResolvers,
  Playbackable: playbackableResolvers,
  ViewerDevice: viewerDeviceResolvers,
};
