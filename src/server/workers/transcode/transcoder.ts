import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { createInterface } from 'readline';
import { TranscodeWorkerParam } from '.';
import { config } from '../../config';
import { FileSource } from '../../models/FileSource';
import { TranscodeStatus } from '../../models/TranscodedSource';
import { AudioStream, VideoStream } from '../../types/ffprobe';
import { transcodeLogger } from '../../utils/logging';
import { ffprobe } from '../../utils/transcode/ffprobe';

export class Transcoder extends EventEmitter {
  private source?: FileSource;
  private ffmpeg?: ChildProcessWithoutNullStreams;

  transcodedDuration = 0;

  get progress() {
    if (!this.source) return 0;
    return Math.ceil(this.source.duration / this.transcodedDuration);
  }

  constructor(private params: TranscodeWorkerParam) {
    super();
  }

  async lookup() {
    this.source = await FileSource.findOne(this.params.sourceId);
    if (!this.source) throw new Error('source not found');

    if (this.source.status !== 'pending')
      throw new Error('the source has already been transcoded or failed');
  }

  private async probeSource() {
    if (!this.source) throw new Error('source not set');

    const result = await ffprobe(
      `${config.paths.source}/${this.source.id}/source.${
        this.source.sourceExtension
      }`,
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

    this.source.sourceWidth = video.width;
    this.source.sourceHeight = video.height;
    this.source.duration = Number(video.duration);

    await this.source.save();
  }

  async probe() {
    if (!this.source) throw new Error('source not set');
    if (this.source.sourceWidth !== 0) throw new Error('already probed');

    try {
      await this.probeSource();
    } catch (err) {
      transcodeLogger.error('failed to probe', err);

      this.source.error = err.toString();
      this.source.status = 'failed';
      await this.source.save();
    }
  }

  // probed?
  get transcodable() {
    return this.source && this.source.sourceWidth > 0;
  }

  private get transcodeArgs() {
    if (!this.source) throw new Error('source not set');

    return [
      '-i',
      `${config.paths.source}/${this.source.id}/source.${
        this.source.sourceExtension
      }`,
      '-c',
      'copy',
      '-f',
      'hls',
      '-hls_time',
      '5',
      '-hls_flags',
      'single_file',
      '-hls_list_size',
      '1',
      '-hls_segment_filename',
      `${config.paths.source}/${this.source.id}/stream.ts`,
      '-',
    ];
  }

  private async finalize(status: TranscodeStatus = 'success') {
    if (!this.source) throw new Error('source not set');

    this.source.status = status;
    await this.source.save();
  }

  async transcode() {
    return new Promise<void>((resolve, reject) => {
      const args = this.transcodeArgs;
      transcodeLogger.debug('transcode params', ...args);

      this.ffmpeg = spawn('ffmpeg', args, {
        stdio: 'pipe',
      });

      transcodeLogger.info('transcoder pid:', this.ffmpeg.pid);

      const readline = createInterface(this.ffmpeg.stdout);
      const buffer: string[] = [];
      readline.on('line', async line => {
        if (!this.source) {
          // 普通はありえない
          transcodeLogger.fatal('no source');
          this.ffmpeg!.kill('KILL');
          return reject('no source');
        }

        try {
          if (line.match(/#EXTM3U/)) {
            if (
              buffer
                .join('\n')
                .match(/#EXTINF:([\d\.]+),[\n\r]+#EXT-X-BYTERANGE:(\d+)@(\d+)/)
            ) {
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

              const item = Buffer.alloc(8 + 6 * 2);

              item.writeDoubleBE(duration, 0);
              item.writeUIntBE(length, 8, 6);
              item.writeUIntBE(offset, 14, 6);

              this.source.manifest = Buffer.concat([
                this.source.manifest,
                item,
              ]);
              this.transcodedDuration += duration;

              this.emit('duration', this.transcodedDuration);

              await this.source.save();
            }

            buffer.splice(0, buffer.length);
          }
          buffer.push(line);
        } catch (err) {
          transcodeLogger.error('failed to update hls manifest', err);
          if (this.ffmpeg) {
            this.ffmpeg.kill('KILL');
          }
        }
      });

      this.ffmpeg.on('error', async err => {
        await this.finalize('failed');
        reject(err);
      });

      this.ffmpeg.on('close', async code => {
        if (code === 0) {
          transcodeLogger.info(
            'transcode successful',
            'duration:',
            this.transcodedDuration,
          );

          await this.finalize();
          resolve();
        } else {
          transcodeLogger.error('ffmpeg exit code', code);

          await this.finalize('failed');
          reject(`exit code: ${code}`);
        }
      });
    });
  }
}
