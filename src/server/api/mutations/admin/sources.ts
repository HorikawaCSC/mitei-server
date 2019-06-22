import { MutationResolvers } from '../../../generated/graphql';
import { FileSource } from '../../../models/FileSource';
import { extractExtension } from '../../../utils/filename';
import { ensureLoggedInAsAdmin } from '../../../utils/gql/ensureUser';

export const sourcesMutationResolvers: MutationResolvers = {
  createFileSourceUpload: ensureLoggedInAsAdmin(
    async (_parent, { fileInfo }, { userInfo }) => {
      const ext = extractExtension(fileInfo.filename);
      if (!ext || ext === '') {
        throw new Error('no extension is provided');
      }

      const source = new FileSource();
      source.sourceSize = fileInfo.size;
      source.sourceExtension = ext;
      source.createdBy = userInfo.id!;

      return await source.save();
    },
  ),
  transcodeFileSource: () => true,
};
