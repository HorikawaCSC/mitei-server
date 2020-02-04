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
  FileSource,
  FileSourceDocument,
  Manifest,
  SourceStatus,
  TranscodePreset,
  TranscodePresetDocument,
  TranscodeStatus,
} from '@mitei/server-models';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { createInterface } from 'readline';
import { TranscodeWorkerParam } from '.';
import { config } from '../../config';
import { ffprobe } from '../../streaming/transcode/ffprobe';
import { AudioStream, VideoStream } from '../../types/ffprobe';
import { transcodeLogger } from '../../utils/logging';

export class Transcoder extends EventEmitter {
  private source: FileSourceDocument | null = null;
  private ffmpeg?: ChildProcessWithoutNullStreams;
  private preset: TranscodePresetDocument | null = null;

  transcodedDuration = 0;

  get progress() {
    if (!this.source || !this.source.source.duration) return 0;
    if (this.source.status === TranscodeStatus.Success) return 100;

    return Math.min(
      Math.ceil((this.transcodedDuration / this.source.source.duration) * 100),
      100,
    );
  }

  constructor(private params: TranscodeWorkerParam) {
    super();
  }

  async lookup() {
    this.source = await FileSource.findById(this.params.sourceId);
    if (!this.source) throw new Error('source not found');

    if (this.transcodable) {
      if (this.source.status !== TranscodeStatus.Pending)
        throw new Error('the source has already been transcoded or failed');
    }
    if (this.source.source.status !== SourceStatus.Available)
      throw new Error('the source is not available');
  }

  async probe() {
    if (!this.source) throw new Error('source not set');
    if (this.source.source.width) throw new Error('already probed');

    const result = await ffprobe(
      `${config.paths.source}/${this.source.id}/source.${this.source.source.extension}`,
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

    this.source.source.width = video.width;
    this.source.source.height = video.height;

    this.source.source.duration = Number(video.duration);
    if (isNaN(this.source.source.duration)) this.source.source.duration = 0;

    this.source.status = TranscodeStatus.Pending;

    await this.source.save();
  }

  async probeTranscoded() {
    if (!this.source) throw new Error('source not set');

    const result = await ffprobe(
      `${config.paths.source}/${this.source.id}/stream.mts`,
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

    this.source.width = video.width;
    this.source.height = video.height;

    await this.source.save();
  }

  // probed?
  get transcodable() {
    return this.source && this.source.source.width;
  }

  private getTranscodeArgs() {
    if (!this.source) throw new Error('source not set');
    if (!this.preset) throw new Error('preset not set');

    return [
      '-i',
      `${config.paths.source}/${this.source.id}/source.${this.source.source.extension}`,
      '-c',
      'copy',
      '-f',
      'hls',
      ...this.preset.parameter,
      '-hls_time',
      '0',
      '-hls_flags',
      'single_file',
      '-hls_list_size',
      '1',
      '-hls_ts_options',
      'mpegts_m2ts_mode=0',
      '-hls_segment_filename',
      `${config.paths.source}/${this.source.id}/stream.mts`,
      '-',
    ];
  }

  private async setStatus(status: TranscodeStatus) {
    if (!this.source) throw new Error('source not set');

    // ここで、データ壊れてるかも
    await this.source.updateOne({
      $set: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  async transcode() {
    if (!this.source) throw new Error('source not set');

    this.preset = await TranscodePreset.findById(this.params.presetId);
    if (!this.preset) throw new Error('specific preset is not found');

    this.source.presetId = this.preset._id;
    this.source.manifest = []; // reset manifest
    this.source.duration = 0;
    await this.source.save();

    await this.setStatus(TranscodeStatus.Running);
    const args = this.getTranscodeArgs();
    transcodeLogger.debug('transcode params', ...args);

    this.ffmpeg = spawn('ffmpeg', args, {
      stdio: 'pipe',
    });

    transcodeLogger.info('transcoder pid:', this.ffmpeg.pid);

    this.ffmpeg.stderr.on('data', data =>
      transcodeLogger.trace(data.toString('utf8')),
    );

    const exitPromise = new Promise<void>(async (resolve, reject) => {
      if (!this.ffmpeg) return reject();
      this.ffmpeg.on('error', async err => {
        reject(err);
      });

      this.ffmpeg.on('close', async code => {
        if (code === 0) {
          resolve();
        } else {
          transcodeLogger.error('ffmpeg exit code', code);

          reject(`exit code: ${code}`);
        }
      });
    });

    const readline = createInterface(this.ffmpeg.stdout);
    const buffer: string[] = [];
    for await (const line of readline) {
      if (!this.source) {
        if (this.ffmpeg) this.ffmpeg.kill();
        throw new Error('no source');
      }

      try {
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

            if (length <= 0) continue;

            transcodeLogger.trace(
              'segment',
              this.source.id,
              duration,
              length,
              offset,
            );

            const item: Manifest = [offset, length, duration, 0];

            await this.source.updateOne({
              $push: {
                manifest: item,
              },
              $set: {
                updatedAt: new Date(),
              },
              $inc: {
                duration,
              },
            });
            this.transcodedDuration += duration;

            this.emit('duration', this.transcodedDuration);
          }
        }
        buffer.push(line);
      } catch (err) {
        transcodeLogger.error('failed to update hls manifest', err);
        if (this.ffmpeg) {
          this.ffmpeg.kill('KILL');
        }
      }
    }

    await exitPromise;

    transcodeLogger.info(
      'transcode successful',
      'duration:',
      this.transcodedDuration,
    );

    await this.probeTranscoded();

    transcodeLogger.info('transcoded source was probed');

    await this.setStatus(TranscodeStatus.Success);
  }
}
