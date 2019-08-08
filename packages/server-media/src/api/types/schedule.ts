import { ScheduleResolvers } from '../../generated/graphql';

export const scheduleResolvers: ScheduleResolvers = {
  channel: async parent => {
    await parent.populate('channel').execPopulate();
    if (!parent.channel) throw new Error('failed to populate');

    return parent.channel;
  },
  isValid: parent => parent.isProgramValid(),
};
