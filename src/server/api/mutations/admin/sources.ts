import { createWriteStream, existsSync, promises as fs } from 'fs';
import { config } from '../../../config';
import { MutationResolvers } from '../../../generated/graphql';
import { FileSource } from '../../../models/FileSource';
import { GqlUpload } from '../../../types/gql-upload';
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
      source.name = fileInfo.filename;

      return await source.save();
    },
  ),
  uploadFileSourceChunk: ensureLoggedInAsAdmin(
    async (_parent, { file, sourceId }, { userInfo }) => {
      const source = await FileSource.findOne({
        id: sourceId,
        createdBy: userInfo.id!,
      });

      if (!source) {
        throw new Error('source not found');
      }

      const dirPath = `${config.paths.source}/${source.id}`;
      const filePath = `${dirPath}/source.${source.sourceExtension}`;
      if (!existsSync(dirPath)) {
        // in this case, offset must be 0
        if (file.begin !== 0) throw new Error('offset != 0');
        await fs.mkdir(dirPath);
      }
      if (existsSync(filePath)) {
        const fileInfo = await fs.stat(filePath);
        if (fileInfo.size !== file.begin) throw new Error('invalid offset');
        if (fileInfo.size + file.size > source.sourceSize)
          throw new Error('chunk too large');
      } else {
        if (file.begin !== 0) throw new Error('offset != 0');
      }

      const stream = createWriteStream(filePath, { flags: 'a' });
      const upload = (await file.chunk) as GqlUpload;
      upload.stream.pipe(stream);

      await new Promise((resolve, reject) => {
        stream.on('close', () => resolve());
        upload.stream.on('error', e => reject(e));
        stream.on('error', e => reject(e));
      });

      const fileInfo = await fs.stat(filePath);
      if (fileInfo.size === source.sourceSize) {
        source.sourceStatus = 'avail';
        await source.save();
        return true;
      }

      return false;
    },
  ),
  transcodeFileSource: () => true,
};
