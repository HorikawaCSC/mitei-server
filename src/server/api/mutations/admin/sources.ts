import { MutationResolvers } from '../../../generated/graphql';
import { FileSource } from '../../../models/FileSource';
import { checkAdmin } from '../../../utils/auth';
import { extractExtension } from '../../../utils/filename';

export const sourcesMutationResolvers: MutationResolvers = {
  createFileSourceUpload: async (_parent, { fileInfo }, { userInfo }) => {
    checkAdmin(userInfo);

    const ext = extractExtension(fileInfo.filename);
    if (!ext || ext === '') {
      throw new Error('no extension is provided');
    }

    const source = new FileSource();
    source.sourceSize = fileInfo.size;
    source.sourceExtension = ext;

    return await source.save();
  },
  transcodeFileSource: () => true,
};
