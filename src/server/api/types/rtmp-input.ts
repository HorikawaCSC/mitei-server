import { config } from '../../config';
import { RtmpInputResolvers } from '../../generated/graphql';
import { ensureLoggedInAsAdmin } from '../../utils/gql/ensureUser';

export const rtmpInputResolvers: RtmpInputResolvers = {
  createdBy: ensureLoggedInAsAdmin(async source => {
    await source.populate('createdBy').execPopulate();
    if (!source.createdBy) throw new Error('failed to populate');

    return source.createdBy;
  }),
  preset: ensureLoggedInAsAdmin(async source => {
    await source.populate('preset').execPopulate();
    if (!source.preset) throw new Error('failed to populate');

    return source.preset;
  }),
  publishUrl: source => {
    return `${config.streaming.rtmpClientEndpoint}/${source.id}`;
  },
};
