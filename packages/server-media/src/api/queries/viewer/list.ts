import { ViewerDevice } from '@mitei/server-models';
import { QueryResolvers } from '../../../generated/graphql';
import { omitUndefined } from '../../../utils/db';
import { ensureLoggedInAsAdmin } from '../../../utils/gql/ensureUser';

export const viewerListQueryResolvers: QueryResolvers = {
  viewerDevices: ensureLoggedInAsAdmin(
    async (_parent, { skip, take, ...query }) => {
      const conditions = omitUndefined(query);

      const total = await ViewerDevice.countDocuments(conditions);
      const result = await ViewerDevice.find(conditions)
        .skip(skip || 0)
        .limit(take || 10)
        .exec();

      return {
        devices: result,
        total,
      };
    },
  ),
};
