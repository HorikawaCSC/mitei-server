import { TranscodePreset } from '@mitei/server-models';
import { MutationResolvers } from '../../../../generated/graphql';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';

export const transcodePresetMutationResolvers: MutationResolvers = {
  createTranscodePreset: ensureLoggedInAsAdmin(
    async (_preset, { name, parameter }, { userInfo }) => {
      const preset = new TranscodePreset();
      preset.name = name;
      preset.parameter = parameter;
      preset.createdById = userInfo._id;

      return await preset.save();
    },
  ),
};
