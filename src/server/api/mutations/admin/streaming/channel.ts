import { MutationResolvers } from '../../../../generated/graphql';
import { Channel, FillerControl } from '../../../../models/streaming/Channel';
import { TranscodedSource } from '../../../../models/TranscodedSource';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';

export const channelMutationResolvers: MutationResolvers = {
  createChannel: ensureLoggedInAsAdmin(
    async (
      _parent,
      { id, displayName, fillerControl, fillerSources: fillerSourceIds },
      { userInfo },
    ) => {
      const channel = new Channel();
      channel._id = id;
      channel.displayName = displayName;
      channel.fillerSources = [];
      channel.createdById = userInfo._id;
      channel.fillerControl = fillerControl || FillerControl.Random;

      if (fillerSourceIds.length > 0) {
        const fillerSources = await TranscodedSource.find({
          _id: {
            $in: fillerSourceIds,
          },
        });

        if (fillerSources.length !== fillerSourceIds.length) {
          throw new Error('invalid ids');
        }

        channel.fillerSourceIds = fillerSources.map(source => source._id);
      }

      return await channel.save();
    },
  ),
};
