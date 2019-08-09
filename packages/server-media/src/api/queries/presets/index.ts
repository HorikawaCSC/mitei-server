import { QueryResolvers } from '../../../generated/graphql';
import { TranscodePreset } from '../../../models/TranscodePreset';
import { omitUndefined } from '../../../utils/db';
import { ensureLoggedInAsAdmin } from '../../../utils/gql/ensureUser';

export const presetQueryResolvers: QueryResolvers = {
  transcodePreset: ensureLoggedInAsAdmin(async (_parent, { id }) => {
    const preset = await TranscodePreset.findById(id);
    if (!preset) throw new Error('no preset');
    return preset;
  }),
  transcodePresetList: ensureLoggedInAsAdmin(
    async (_parent, { skip, take, ...query }) => {
      const conditions = omitUndefined(query);

      const total = await TranscodePreset.countDocuments(conditions);
      const result = await TranscodePreset.find(conditions)
        .skip(skip || 0)
        .limit(take || 10)
        .exec();

      return {
        presets: result,
        total,
      };
    },
  ),
};
