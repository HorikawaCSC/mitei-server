import { QueryResolvers } from '../../../generated/graphql';
import { FileSource } from '../../../models/FileSource';
import { omitUndefined } from '../../../utils/db';
import { ensureLoggedInAsAdmin } from '../../../utils/gql/ensureUser';

export const sourcesQueryResolvers: QueryResolvers = {
  fileSource: ensureLoggedInAsAdmin(async (_parent, { sourceId }) => {
    return (await FileSource.findOne(sourceId)) || null;
  }),
  fileSources: ensureLoggedInAsAdmin(
    async (_parent, { take, skip, ...query }) => {
      const [result, total] = await FileSource.findAndCount({
        where: omitUndefined(query),
        skip: skip || 0,
        take: take || 10,
      });

      return {
        sources: result,
        total,
      };
    },
  ),
};
