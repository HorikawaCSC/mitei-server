import { MutationResolvers } from '../../../../generated/graphql';
import { transcodePresetMutationResolvers } from './transcode-preset';

export const sourcesMutationResolvers: MutationResolvers = {
  ...transcodePresetMutationResolvers,
};
