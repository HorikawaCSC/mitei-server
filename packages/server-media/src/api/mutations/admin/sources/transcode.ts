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
