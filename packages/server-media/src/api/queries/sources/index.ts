import {
  FileSource,
  RecordSource,
  RtmpInput,
  TranscodedSource,
} from '@mitei/server-models';
import { QueryResolvers } from '../../../generated/graphql';
import { omitUndefined } from '../../../utils/db';
import { ensureLoggedInAsAdmin } from '../../../utils/gql/ensureUser';

export const sourcesQueryResolvers: QueryResolvers = {
  fileSource: ensureLoggedInAsAdmin(async (_parent, { sourceId }) => {
    return (await FileSource.findById(sourceId)) || null;
  }),
  fileSourceList: ensureLoggedInAsAdmin(
    async (_parent, { take, skip, ...query }) => {
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
  ),
  rtmpInputList: ensureLoggedInAsAdmin(async (_parent, { take, skip }) => {
    const total = await RtmpInput.countDocuments();
    const result = await RtmpInput.find()
      .skip(skip || 0)
      .limit(take || 10);

    return {
      inputs: result,
      total,
    };
  }),
  recordSource: ensureLoggedInAsAdmin(async (_parent, { sourceId }) => {
    return (await RecordSource.findById(sourceId)) || null;
  }),
  recordSourceList: ensureLoggedInAsAdmin(
    async (_parent, { take, skip, ...query }) => {
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
  ),
  // @ts-ignore
  source: ensureLoggedInAsAdmin(async (_parent, { sourceId }) => {
    return (await TranscodedSource.findById(sourceId)) || null;
  }),
  sourceList: ensureLoggedInAsAdmin(
    async (_parent, { take, skip, ...query }) => {
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
  ),
};
