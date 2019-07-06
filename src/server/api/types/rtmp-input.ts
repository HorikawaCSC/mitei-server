import { RtmpInputResolvers } from '../../generated/graphql';
import { ensureLoggedInAsAdmin } from '../../utils/gql/ensureUser';

export const rtmpInputResolvers: RtmpInputResolvers = {
  createdBy: ensureLoggedInAsAdmin(async source => {
    await source.populate('createdBy');
    if (!source.createdBy) throw new Error('failed to populate');

    return source.createdBy;
  }),
};
