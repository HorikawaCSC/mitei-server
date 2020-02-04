/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

import { FileSource, SourceStatus } from '@mitei/server-models';
import { createWriteStream, existsSync, promises as fs } from 'fs';
import { config } from '../../../../config';
import { MutationResolvers } from '../../../../generated/graphql';
import { GqlUpload } from '../../../../types/gql-upload';
import { extractExtension } from '../../../../utils/filename';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';
import { transcodeWorker } from '../../../../workers/transcode';

export const fileSourceMutationResolvers: MutationResolvers = {
  createFileSourceUpload: ensureLoggedInAsAdmin(
    async (_parent, { fileInfo }, { userInfo }) => {
      const ext = extractExtension(fileInfo.filename);
      if (!ext || ext === '') {
        throw new Error('no extension is provided');
      }

      const source = new FileSource();
      source.source = {
        fileSize: fileInfo.size,
        extension: ext,
        status: SourceStatus.Uploading,
      };
      source.createdById = userInfo.id!;
      source.name = fileInfo.filename;

      return await source.save();
    },
  ),
  uploadFileSourceChunk: ensureLoggedInAsAdmin(
    async (_parent, { file, sourceId }, { userInfo }) => {
      const source = await FileSource.findOne({
        _id: sourceId,
        createdBy: userInfo.id!,
      });

      if (!source) {
        throw new Error('source not found');
      }

      const dirPath = `${config.paths.source}/${source.id}`;
      const filePath = `${dirPath}/source.${source.source.extension}`;
      if (!existsSync(dirPath)) {
        // in this case, offset must be 0
        if (file.begin !== 0) throw new Error('offset != 0');
        await fs.mkdir(dirPath);
      }
      if (existsSync(filePath)) {
        const fileInfo = await fs.stat(filePath);
        if (fileInfo.size !== file.begin) throw new Error('invalid offset');
        if (fileInfo.size + file.size > source.source.fileSize)
          throw new Error('chunk too large');
      } else {
        if (file.begin !== 0) throw new Error('offset != 0');
      }

      const stream = createWriteStream(filePath, { flags: 'a' });
      const upload = (await file.chunk) as GqlUpload;
      const inputStream = upload.createReadStream();
      inputStream.pipe(stream);

      await new Promise((resolve, reject) => {
        stream.on('close', () => resolve());
        inputStream.on('error', e => reject(e));
        stream.on('error', e => reject(e));
      });

      const fileInfo = await fs.stat(filePath);
      if (fileInfo.size === source.source.fileSize) {
        source.source.status = SourceStatus.Available;
        await source.save();
        return true;
      }

      return false;
    },
  ),
  probeFileSource: ensureLoggedInAsAdmin(async (_parent, { sourceId }) => {
    const source = await FileSource.findById(sourceId);

    if (!source) {
      throw new Error('source not found');
    }

    await transcodeWorker.enqueueProbe(source);
    return true;
  }),
};
