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

import {
  FileSource,
  RecordSource,
  RtmpInput,
  TranscodedSource,
} from '@mitei/server-models';
import { QueryResolvers } from '../../../generated/graphql';
import { omitUndefined } from '../../../utils/db';

export const sourcesQueryResolvers: QueryResolvers = {
  fileSource: async (_parent, { sourceId }) => {
    return (await FileSource.findById(sourceId)) || null;
  },
  fileSourceList: async (_parent, { take, skip, ...query }) => {
    const conditions = omitUndefined(query);

    const total = await FileSource.countDocuments(conditions);
    const result = await FileSource.find(conditions)
      .skip(skip || 0)
      .limit(take || 10)
      .select('-manifest')
      .exec();

    return {
      sources: result,
      total,
    };
  },

  rtmpInputList: async (_parent, { take, skip }) => {
    const total = await RtmpInput.countDocuments();
    const result = await RtmpInput.find()
      .skip(skip || 0)
      .limit(take || 10);

    return {
      inputs: result,
      total,
    };
  },
  recordSource: async (_parent, { sourceId }) => {
    return (await RecordSource.findById(sourceId)) || null;
  },
  recordSourceList: async (_parent, { take, skip, ...query }) => {
    const conditions = omitUndefined(query);

    const total = await RecordSource.countDocuments(conditions);
    const result = await RecordSource.find(conditions)
      .skip(skip || 0)
      .limit(take || 10)
      .select('-manifest')
      .exec();

    return {
      sources: result,
      total,
    };
  },

  // @ts-ignore
  source: async (_parent, { sourceId }) => {
    return (await TranscodedSource.findById(sourceId)) || null;
  },
  sourceList: async (_parent, { take, skip, ...query }) => {
    const conditions = omitUndefined(query);

    const total = await TranscodedSource.countDocuments(conditions);
    const result = await TranscodedSource.find(conditions)
      .skip(skip || 0)
      .limit(take || 10)
      .select('-manifest')
      .exec();

    return {
      sources: result,
      total,
    };
  },
};
