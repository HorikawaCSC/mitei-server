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
