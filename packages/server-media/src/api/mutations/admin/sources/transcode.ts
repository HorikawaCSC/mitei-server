import { FileSource, TranscodePreset } from '@mitei/server-models';
import { MutationResolvers } from '../../../../generated/graphql';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';
import { transcodeWorker } from '../../../../workers/transcode';

export const transcodeMutationResolvers: MutationResolvers = {
  enqueueFileSourceTranscode: ensureLoggedInAsAdmin(
    async (_parent, { sourceId, presetId }) => {
      const source = await FileSource.findById(sourceId);
      if (!source) throw new Error('source not found');
      if (!source.transcodable)
        throw new Error('source is not able to be transcoded');

      const preset = await TranscodePreset.findById(presetId);
      if (!preset) throw new Error('preset not found');

      await transcodeWorker.enqueueTranscode(source, preset);

      return true;
    },
  ),
};
