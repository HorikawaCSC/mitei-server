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
  Manifest,
  RecordSource,
  RecordSourceDocument,
  RtmpInputDocument,
  TranscodeStatus,
} from '@mitei/server-models';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { existsSync, promises as fs } from 'fs';
import { DateTime } from 'luxon';
import { createInterface } from 'readline';
import { config } from '../../config';
import { ffprobe } from '../../streaming/transcode/ffprobe';
import { AudioStream, VideoStream } from '../../types/ffprobe';
import { liveHlsLogger } from '../../utils/logging';
import { sleep } from '../../utils/sleep';
import { thumbnailWorker } from '../thumbnail';
import { lockLiveSource, unlockLiveSource } from './lock';

export class LiveHLSWorker extends EventEmitter {
  private ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
  private record: RecordSourceDocument | null = null;
  private exitPromise: Promise<void> | null = null;
  isExited = false;
  constructor(public source: RtmpInputDocument) {
    super();
  }

  private async createRecord() {
    this.record = new RecordSource();
    const dateTime = DateTime.local().toFormat('yyyy/MM/dd HH:mm');
    this.record.name = `${this.source.name} - ${dateTime}`;
    this.record.source = this.source.id!;
    this.record.duration = 0;
    this.record.createdById = this.source.createdById;
    this.record.presetId = this.source.presetId;

    return await this.record.save();
  }

  private getTranscodeParam() {
    if (!this.record) throw new Error('record must not be null');
    if (!this.source.preset) throw new Error('preset must not be null');

    return [
      '-i',
      `${config.streaming.rtmpAddress}/${this.source.id}`,
      ...this.source.preset.parameter,
      '-g',
      '90',
      '-f',
      'hls',
      '-hls_time',
      '1',
      '-hls_flags',
      'single_file',
      '-hls_list_size',
      '1',
      '-hls_ts_options',
      'mpegts_m2ts_mode=0',
      '-mpegts_m2ts_mode',
      '0',
      '-hls_segment_filename',
      `${config.paths.source}/${this.record.id}/stream.mts`,
      '-',
    ];
  }

  private async createDir() {
    if (!this.source || !this.record) throw new Error('source invalid');

    if (!existsSync(`${config.paths.source}/${this.record.id}`)) {
      await fs.mkdir(`${config.paths.source}/${this.record.id}`);
    } else {
      throw new Error('uuid duplicate');
    }
  }

  private async startTranscoder() {
    if (!this.record) return;

    this.ffmpegProcess = spawn('ffmpeg', this.getTranscodeParam(), {
      stdio: 'pipe',
    });

    this.ffmpegProcess.stderr.on('data', data =>
      liveHlsLogger.trace(data.toString('utf8')),
    );

    await this.setStatus(TranscodeStatus.Running);

    const readline = createInterface(this.ffmpegProcess.stdout);
    const buffer: string[] = [];
    readline.on('line', async line => {
      if (!this.record) return;
      if (line.match(/\.mts/)) {
        if (
          buffer
            .join('\n')
            .match(/#EXTINF:([\d\.]+),[\n\r]+#EXT-X-BYTERANGE:(\d+)@(\d+)/)
        ) {
          buffer.splice(0, buffer.length);
          const [duration, length, offset] = [
            Number(RegExp.$1),
            Number(RegExp.$2),
            Number(RegExp.$3),
          ];
          liveHlsLogger.trace(
            'segment',
            this.record.id,
            duration,
            length,
            offset,
          );

          const manifestEntry: Manifest = [
            offset,
            length,
            duration,
            Date.now(),
          ];

          await this.record.updateOne({
            $push: {
              manifest: manifestEntry,
            },
            $inc: {
              duration,
            },
            $set: {
              updatedAt: new Date(),
              lastManifestAppend: new Date(),
            },
          });
          await lockLiveSource(this.source);
        }
      }
      buffer.push(line);
    });

    this.exitPromise = new Promise((resolve, reject) => {
      if (!this.ffmpegProcess) return resolve();
      this.ffmpegProcess.on('error', async err => {
        this.isExited = true;
        this.emit('end', true);
        await this.finalize(TranscodeStatus.Failed);
        reject(err);
      });
      this.ffmpegProcess.on('exit', async code => {
        this.isExited = true;
        if (code === 0) {
          this.emit('end');
          await this.finalize(TranscodeStatus.Success);
          resolve();
        } else {
          this.emit('end', true);
          await this.finalize(TranscodeStatus.Failed);
          reject(`code: ${code}`);
        }
      });
    });
  }

  async probeTranscoded() {
    if (!this.record) throw new Error('record not set');

    const result = await ffprobe(
      `${config.paths.source}/${this.record.id}/stream.mts`,
    );

    const audio = result.streams.find(
      (stream): stream is AudioStream => stream.codec_type === 'audio',
    );
    const video = result.streams.find(
      (stream): stream is VideoStream => stream.codec_type === 'video',
    );

    if (!video) {
      throw new Error('no video');
    }
    if (!video.width || !video.height) {
      throw new Error('invalid video');
    }
    if (audio) {
      if (audio.channels > 2) {
        throw new Error('audio must be stereo or mono');
      }
    }

    this.record.width = video.width;
    this.record.height = video.height;

    await this.record.save();
  }

  private async finalize(status: TranscodeStatus) {
    await this.setStatus(status);
    await unlockLiveSource(this.source);

    await this.probeTranscoded();

    if (status === TranscodeStatus.Success) {
      await thumbnailWorker.enqueue(this.record!);
    }
  }

  private async setStatus(status: TranscodeStatus) {
    if (!this.record) throw new Error('record not set');

    // ここで、データ壊れてるかも
    await this.record.updateOne({
      $set: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  getRecord() {
    return this.record;
  }

  async start() {
    if (this.ffmpegProcess) throw new Error('ffmpeg already started');
    if (!this.source.id) throw new Error('uninitialized source');

    try {
      await this.source.populate('preset').execPopulate();

      await this.createRecord();
      await this.createDir();
      await this.startTranscoder();
    } catch (err) {
      liveHlsLogger.error(err);
      await this.finalize(TranscodeStatus.Failed);
    }
  }

  async tryStop() {
    if (!this.ffmpegProcess || !this.exitPromise)
      throw new Error('ffmpeg ended or not started');
    this.ffmpegProcess.kill('SIGTERM');
    await Promise.race([this.exitPromise, sleep(1000 * 5)]);
    if (!this.isExited) {
      try {
        this.ffmpegProcess.kill('SIGKILL');
        await Promise.race([this.exitPromise, sleep(1000 * 5)]);
        if (!this.isExited) {
          await this.finalize(TranscodeStatus.Failed);
          throw new Error('failed to kill ffmpeg');
        }
      } catch (e) {
        liveHlsLogger.error('failed to send KILL signal');
        return;
      }
    }

    await this.finalize(TranscodeStatus.Success);
  }
}
