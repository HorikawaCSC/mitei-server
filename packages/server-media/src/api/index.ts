/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

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
  Playbackable: playbackableResolvers,
  ViewerDevice: viewerDeviceResolvers,
};
