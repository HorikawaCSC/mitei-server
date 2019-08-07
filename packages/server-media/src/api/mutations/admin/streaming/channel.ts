import { MutationResolvers } from '../../../../generated/graphql';
import { Channel, FillerControl } from '../../../../models/streaming/Channel';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';

export const channelMutationResolvers: MutationResolvers = {
  createChannel: ensureLoggedInAsAdmin(
    async (_parent, { id, displayName, fillerControl }, { userInfo }) => {
      const channel = new Channel();
      channel._id = id;
      channel.displayName = displayName;
      channel.fillerSources = [];
      channel.createdById = userInfo._id;
      channel.fillerControl = fillerControl || FillerControl.Random;

      return await channel.save();
    },
  ),
};
