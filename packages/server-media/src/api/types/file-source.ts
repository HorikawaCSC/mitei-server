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

import { TranscodeStatus } from '@mitei/server-models';
import { FileSourceResolvers } from '../../generated/graphql';
import { transcodeWorker } from '../../workers/transcode';
import { transcodedSourceResolvers } from './transcoded-source';

export const fileSourceResolvers: FileSourceResolvers = {
  ...transcodedSourceResolvers,
  transcodeProgress: async source => {
    return await transcodeWorker.getTranscodeJobProgress(source);
  },
  status: async source => {
    if (source.status === TranscodeStatus.Pending) {
      const job = await transcodeWorker.getTranscodeJob(source);
      if (job) return TranscodeStatus.Waiting;
    }
    return source.status;
  },
  isProbing: async source => {
    const job = await transcodeWorker.getProbeJob(source);
    if (!job) return false;

    const state = await job.getState();
    return state !== 'completed' && state !== 'failed';
  },
};
