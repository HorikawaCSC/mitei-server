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

import {
  TranscodedSource,
  TranscodedSourceDocument,
  TranscodeStatus,
} from '@mitei/server-models';
import * as Queue from 'bull';
import { exec } from 'child_process';
import { config } from '../../config';
import { thumbnailLogger } from '../../utils/logging';

interface ThumbnailWorkerParam {
  id: string;
}

class ThumbnailWorker {
  private queue = new Queue<ThumbnailWorkerParam>('mitei-thumbnail', {
    redis: config.redis,
  });

  constructor() {
    this.setupQueue();
  }

  private setupQueue() {
    this.queue.process(
      config.limit.transcode,
      async job => await this.processJob(job),
    );

    this.queue.on('failed', async (job, err) => {
      thumbnailLogger.error('job', job.id, 'failed', err, job.stacktrace);
    });
  }

  private async processJob(job: Queue.Job<ThumbnailWorkerParam>) {
    const source = await TranscodedSource.findById(job.data.id);
    if (!source) throw new Error('source not found');
    if (
      source.status !== TranscodeStatus.Success ||
      !source.duration ||
      !source.width ||
      !source.height
    )
      throw new Error('source is not ready');

    const thumbPos = Math.floor(Math.min(6, source.duration - 5));
    if (thumbPos < 0) throw new Error('video is too short');

    const convRate = 320 / source.width;
    const height = Math.floor(source.height * convRate);

    const ffmpegParams = [
      'ffmpeg',
      '-i',
      `${config.paths.source}/${source.id}/stream.mts`,
      '-ss',
      `${thumbPos}`,
      '-vframes',
      '1',
      '-f',
      'image2',
      '-s',
      `320x${height}`,
      '-y',
      `${config.paths.source}/${source.id}/thumb.jpg`,
    ];
    await new Promise((resolve, reject) => {
      exec(ffmpegParams.join(' '), { encoding: 'utf8' }, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  async enqueue(source: TranscodedSourceDocument) {
    await this.queue.add(
      {
        id: source.id,
      },
      {
        jobId: `t:${source.id}`,
        removeOnFail: true,
      },
    );
  }

  async getJob(source: TranscodedSourceDocument) {
    return await this.queue.getJob(`t:${source.id}`);
  }
}

export const thumbnailWorker = new ThumbnailWorker();
