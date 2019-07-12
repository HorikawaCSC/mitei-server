import { FileSourceResolvers } from '../../generated/graphql';
import { transcodeWorker } from '../../workers/transcode';
import { sourceBaseResolvers } from './source-base';

export const fileSourceResolvers: FileSourceResolvers = {
  ...sourceBaseResolvers,
  transcodeProgress: async source => {
    return await transcodeWorker.getTranscodeJobProgress(source);
  },
};
