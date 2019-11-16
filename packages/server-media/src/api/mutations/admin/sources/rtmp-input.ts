import { RtmpInput, TranscodePreset } from '@mitei/server-models';
import { MutationResolvers } from '../../../../generated/graphql';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';

export const rtmpInputMutationResolvers: MutationResolvers = {
  createRtmpInput: ensureLoggedInAsAdmin(
    async (_parent, { name, presetId }, { userInfo }) => {
      const preset = await TranscodePreset.findById(presetId);
      if (!preset) throw new Error('no preset');

      const input = new RtmpInput();
      input.name = name;
      input.createdById = userInfo._id;
      input.presetId = preset._id;

      return await input.save();
    },
  ),
};
