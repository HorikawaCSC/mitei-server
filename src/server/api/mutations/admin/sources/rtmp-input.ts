import { MutationResolvers } from '../../../../generated/graphql';
import { RtmpInput, RtmpStatus } from '../../../../models/RtmpInput';
import { TranscodePreset } from '../../../../models/TranscodePreset';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';

export const rtmpInputMutationResolvers: MutationResolvers = {
  createRtmpInput: ensureLoggedInAsAdmin(
    async (_parent, { name, presetId }, { userInfo }) => {
      const preset = await TranscodePreset.findById(presetId);
      if (!preset) throw new Error('no preset');

      const input = new RtmpInput();
      input.status = RtmpStatus.Unused;
      input.name = name;
      input.createdById = userInfo._id;
      input.presetId = preset._id;

      return await input.save();
    },
  ),
  removeRtmpInput: ensureLoggedInAsAdmin(async (_parent, { id }) => {
    const input = await RtmpInput.findById(id);
    if (!input) throw new Error('not found');
    if (input.status !== RtmpStatus.Unused)
      throw new Error('stream is being used');

    await input.remove();

    return true;
  }),
};
