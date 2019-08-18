import { ObjectID } from 'bson';
import { MutationResolvers } from '../../../../generated/graphql';
import {
  Channel,
  ChannelPermission,
  FillerControl,
} from '../../../../models/streaming/Channel';
import { TranscodedSource } from '../../../../models/TranscodedSource';
import { findIdCondition } from '../../../../utils/db';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';

export const channelMutationResolvers: MutationResolvers = {
  createChannel: ensureLoggedInAsAdmin(
    async (
      _parent,
      { id, displayName, fillerControl, fillerSources, permission },
      { userInfo },
    ) => {
      if (await Channel.findById(id)) {
        throw new Error('channel id was already used');
      }

      const channel = new Channel();
      channel._id = id;
      channel.displayName = displayName;
      channel.createdById = userInfo._id;
      channel.fillerControl = fillerControl || FillerControl.Random;
      channel.permission = permission || ChannelPermission.ViewerOnly;

      if (fillerSources) {
        if (
          (await TranscodedSource.countDocuments({
            _id: { $in: fillerSources },
          })) !== fillerSources.length
        ) {
          throw new Error('filler sources have invalid item(s)');
        }

        channel.fillerSourceIds = fillerSources.map(id => new ObjectID(id));
      } else {
        channel.fillerSources = [];
      }

      return await channel.save();
    },
  ),
  updateChannel: ensureLoggedInAsAdmin(
    async (_parent, { id, displayName, fillerControl, permission }) => {
      const channel = await Channel.findById(id);

      if (!channel) throw new Error('channel not found');

      if (displayName) {
        channel.displayName = displayName;
      }

      if (fillerControl) {
        channel.fillerControl = fillerControl;
      }

      if (permission) {
        channel.permission = permission;
      }

      return await channel.save();
    },
  ),
  addFillerToChannel: ensureLoggedInAsAdmin(
    async (_parent, { id, sources }) => {
      const channel = await Channel.findById(id);

      if (!channel) throw new Error('channel not found');

      const sourceIds = sources.map(id => new ObjectID(id));
      if (
        (await TranscodedSource.countDocuments({
          _id: { $in: sourceIds },
        })) !== sourceIds.length
      ) {
        throw new Error('filler sources have invalid item(s)');
      }

      const undepSources = sourceIds.filter(
        id => !channel.fillerSourceIds.find(findIdCondition(id)),
      );

      await channel.updateOne({
        $addToSet: {
          fillerSources: {
            $each: undepSources,
          },
        },
      });

      return undepSources.map(id => id.toHexString());
    },
  ),
  removeFillerFromChannel: ensureLoggedInAsAdmin(
    async (_parent, { id, sources }) => {
      const channel = await Channel.findById(id);

      if (!channel) throw new Error('channel not found');

      const sourceIds = sources.map(id => new ObjectID(id));
      const existIds = sourceIds.filter(
        id => !!channel.fillerSourceIds.find(findIdCondition(id)),
      );

      await channel.updateOne({
        $pullAll: {
          fillerSources: existIds,
        },
      });

      return existIds.map(id => id.toHexString());
    },
  ),
};
