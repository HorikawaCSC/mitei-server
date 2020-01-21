import { ViewerDevice } from '@mitei/server-models';
import { QueryResolvers } from '../../../generated/graphql';
import { omitUndefined } from '../../../utils/db';

export const viewerListQueryResolvers: QueryResolvers = {
  viewerDevices: async (_parent, { skip, take, ...query }) => {
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
  viewerDevice: async (_parent, { id }) => {
    return await ViewerDevice.findById(id);
  },
};
