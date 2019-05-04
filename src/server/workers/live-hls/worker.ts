import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { existsSync, promises } from 'fs';
import { DateTime } from 'luxon';
import { createInterface } from 'readline';
import { config } from '../../config';
import { RecordSource } from '../../models/RecordSource';
import { RtmpSource } from '../../models/RtmpSource';
import { TranscodeStatus } from '../../models/TranscodedSource';
import { SegmentInfo } from '../../types/hls';
import { liveHlsLogger } from '../../utils/logging';
import { sleep } from '../../utils/sleep';

export class LiveHLSWorker extends EventEmitter {
  private ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
  private record: RecordSource | null = null;
  private exitPromise: Promise<void> | null = null;
  isExited = false;
  constructor(public source: RtmpSource) {
    super();
  }

  private async createRecord() {
    this.record = new RecordSource();
    const dateTime = DateTime.local().toFormat('yyyy/MM/dd HH:mm');
    this.record.name = `${this.source.nameOrDefault} - ${dateTime}`;
    this.record.source = this.source.id!;

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
      '-hls_segment_filename',
      `${config.paths.source}/${this.source.id}/${this.record.id}/stream.ts`,
      '-',
    ];
  }

  private async createDir() {
    if (!this.source || !this.record) throw new Error('source invalid');
    if (!existsSync(`${config.paths.source}/${this.source.id}`)) {
      await promises.mkdir(`${config.paths.source}/${this.source.id}`);
    }

    if (
      !existsSync(`${config.paths.source}/${this.source.id}/${this.record.id}`)
    ) {
      await promises.mkdir(
        `${config.paths.source}/${this.source.id}/${this.record.id}`,
      );
    } else {
      throw new Error('uuid duplicate');
    }
  }

  private startTranscoder() {
    this.ffmpegProcess = spawn('ffmpeg', this.getTranscodeParam(), {
      stdio: 'pipe',
    });

    const readline = createInterface(this.ffmpegProcess.stdout);
    const buffer: string[] = [];
    readline.on('line', async line => {
      if (!this.record) return;
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
          liveHlsLogger.debug(
            'segment',
            this.record.id,
            duration,
            length,
            offset,
          );

          const item = Buffer.alloc(8 + 6 * 2);
          item.writeDoubleBE(duration, 0);
          item.writeUIntBE(length, 8, 6);
          item.writeUIntBE(offset, 14, 6);
          this.record.manifest = Buffer.concat([this.record.manifest, item]);
          await this.record.save();

          this.emit('segment', {
            duration,
            offset,
            length,
          } as SegmentInfo);
        }
        buffer.splice(0, buffer.length);
      }
      buffer.push(line);
    });

    this.exitPromise = new Promise((resolve, reject) => {
      if (!this.ffmpegProcess) return resolve();
      this.ffmpegProcess.on('error', async err => {
        this.isExited = true;
        this.emit('end');
        await this.finalizeRecord('failed');
        reject(err);
      });
      this.ffmpegProcess.on('exit', async code => {
        this.isExited = true;
        this.emit('end');
        if (code === 0) {
          await this.finalizeRecord('success');
          resolve();
        } else {
          await this.finalizeRecord('failed');
          reject(`code: ${code}`);
        }
      });
    });
  }

  private async finalizeRecord(status: TranscodeStatus) {
    this.record!.status = status;
    await this.record!.save();
  }

  getRecord() {
    return this.record;
  }

  async start() {
    if (this.ffmpegProcess) throw new Error('ffmpeg already started');
    if (!this.source.id) throw new Error('uninitialized source');

    await this.createRecord();
    await this.createDir();
    await this.startTranscoder();
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
          await this.finalizeRecord('failed');
          throw new Error('failed to kill ffmpeg');
        }
      } catch (e) {
        liveHlsLogger.error('failed to send KILL signal');
        return;
      }
    }
  }
}
