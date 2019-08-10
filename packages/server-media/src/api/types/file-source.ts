import { FileSourceResolvers } from '../../generated/graphql';
import { TranscodeStatus } from '../../models/TranscodedSource';
import { ensureLoggedInAsAdmin } from '../../utils/gql/ensureUser';
import { transcodeWorker } from '../../workers/transcode';
import { transcodedSourceResolvers } from './transcoded-source';

export const fileSourceResolvers: FileSourceResolvers = {
  ...transcodedSourceResolvers,
  transcodeProgress: ensureLoggedInAsAdmin(async source => {
    return await transcodeWorker.getTranscodeJobProgress(source);
  }),
  status: ensureLoggedInAsAdmin(async source => {
    if (source.status === TranscodeStatus.Pending) {
      const job = await transcodeWorker.getTranscodeJob(source);
      if (job) return TranscodeStatus.Waiting;
    }
    return source.status;
  }),
};
