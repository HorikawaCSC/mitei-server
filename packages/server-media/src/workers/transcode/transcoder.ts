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
import { AudioStream, VideoStream } from '../../types/ffprobe';
import { transcodeLogger } from '../../utils/logging';
import { ffprobe } from '../../utils/transcode/ffprobe';

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

    if (
      this.source.status !== TranscodeStatus.Pending &&
      (!this.transcodable || this.source.status !== TranscodeStatus.Failed) // probed but transcode error
    )
      throw new Error('the source has already been transcoded or failed');
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
    if (audio) {
      if (audio.channels > 2) {
        throw new Error('audio must be stereo or mono');
      }
    }

    this.source.source.width = video.width;
    this.source.source.height = video.height;
    this.source.source.duration = Number(video.duration);

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

    await this.setStatus(TranscodeStatus.Success);
  }
}
