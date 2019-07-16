import { FileSourceResolvers } from '../../generated/graphql';
import { transcodeWorker } from '../../workers/transcode';
import { transcodedSourceResolvers } from './transcoded-source';

export const fileSourceResolvers: FileSourceResolvers = {
  ...transcodedSourceResolvers,
  transcodeProgress: async source => {
    return await transcodeWorker.getTranscodeJobProgress(source);
  },
};
