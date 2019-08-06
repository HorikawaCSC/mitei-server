import { MutationResolvers } from '../../../../generated/graphql';
import { fileSourceMutationResolvers } from './file-source';
import { rtmpInputMutationResolvers } from './rtmp-input';
import { transcodeMutationResolvers } from './transcode';
import { transcodePresetMutationResolvers } from './transcode-preset';

export const sourcesMutationResolvers: MutationResolvers = {
  ...fileSourceMutationResolvers,
  ...rtmpInputMutationResolvers,
  ...transcodePresetMutationResolvers,
  ...transcodeMutationResolvers,
};
