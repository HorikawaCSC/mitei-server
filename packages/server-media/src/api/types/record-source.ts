import { RecordSourceResolvers } from '../../generated/graphql';

export const recordSourceResolvers: RecordSourceResolvers = {
  source: async source => {
    await source.populate('source').execPopulate();
    if (!source.source || !source.source.id) throw new Error('invalid source');

    return source.source;
  },
  preset: async source => {
    await source.populate('preset').execPopulate();
    if (!source.preset) throw new Error('failed to populate');

    return source.preset;
  },
};
