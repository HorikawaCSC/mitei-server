import { QueryResolvers } from '../../../generated/graphql';
import { FileSource } from '../../../models/FileSource';
import { RecordSource } from '../../../models/RecordSource';
import { RtmpInput } from '../../../models/RtmpInput';
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
        .limit(take || 10);

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
        .limit(take || 10);

      return {
        sources: result,
        total,
      };
    },
  ),
};
