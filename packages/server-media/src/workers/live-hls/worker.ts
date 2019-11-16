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
import { liveHlsLogger } from '../../utils/logging';
import { sleep } from '../../utils/sleep';
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

    return await this.record.save();
  }

  private getTranscodeParam() {
    if (!this.record) throw new Error('record must not be null');

    return [
      '-i',
      `${config.streaming.rtmpAddress}/${this.source.id}`,
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
      '-hls_ts_options',
      'mpegts_m2ts_mode=0',
      '-hls_segment_filename',
      `${config.paths.source}/${this.record.id}/stream.m2ts`,
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
      if (line.match(/\.m2ts/)) {
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
        this.emit('end');
        await this.finalize(TranscodeStatus.Failed);
        reject(err);
      });
      this.ffmpegProcess.on('exit', async code => {
        this.isExited = true;
        this.emit('end');
        if (code === 0) {
          await this.finalize(TranscodeStatus.Success);
          resolve();
        } else {
          await this.finalize(TranscodeStatus.Failed);
          reject(`code: ${code}`);
        }
      });
    });
  }

  private async finalize(status: TranscodeStatus) {
    await this.setStatus(status);
    await unlockLiveSource(this.source);
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
    this.ffmpegProcess.kill('TERM');
    await Promise.race([this.exitPromise, sleep(1000 * 5)]);
    if (!this.isExited) {
      try {
        this.ffmpegProcess.kill('KILL');
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
