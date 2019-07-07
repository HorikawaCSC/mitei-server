import { RecordSourceResolvers } from '../../generated/graphql';

export const recordSourceResolvers: RecordSourceResolvers = {
  source: async source => {
    await source.populate('source').execPopulate();
    if (!source.source || !source.source.id) throw new Error('invalid source');

    return source.source;
  },
};
