import { TranscodePreset } from '@mitei/server-models';
import { QueryResolvers } from '../../../generated/graphql';
import { omitUndefined } from '../../../utils/db';

export const presetQueryResolvers: QueryResolvers = {
  transcodePreset: async (_parent, { id }) => {
    const preset = await TranscodePreset.findById(id);
    if (!preset) throw new Error('no preset');
    return preset;
  },
  transcodePresetList: async (_parent, { skip, take, ...query }) => {
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
};
