import {
  RecordSource,
  RtmpInput,
  RtmpInputDocument,
  RtmpStatus,
  TranscodeStatus,
} from '@mitei/server-models';
import { config } from '../../config';
import { liveHlsLogger } from '../../utils/logging';
import { LiveHLSWorker } from './worker';

class LiveHLSManager {
  private workers: Map<string, LiveHLSWorker> = new Map();

  async create(source: RtmpInputDocument) {
    if (!source.id) throw new Error('source must have `id`');

    if (this.workers.size > config.limit.stream) {
      throw new Error('too many streams');
    }

    if (this.workers.has(source.id)) {
      liveHlsLogger.warn('Same source worker is still running');
      throw new Error('already broadcasting');
    }

    const worker = new LiveHLSWorker(source);
    this.workers.set(source.id, worker);

    await worker.start();

    liveHlsLogger.debug('source:', source.id, 'started');

    worker.on('end', () => {
      if (!source.id) throw new Error('source invalid');
      this.workers.delete(source.id);
      liveHlsLogger.debug('source:', source.id, 'stopped');
    });

    const record = worker.getRecord();
    if (!record) throw new Error('worker does not start correctly');

    return worker;
  }

  async stop(source: RtmpInputDocument) {
    if (!source.id) throw new Error('source must have `id`');
    if (this.workers.has(source.id)) {
      const worker = this.workers.get(source.id);

      if (worker) await worker.tryStop();
    } else {
      liveHlsLogger.debug('ffmpeg seemed to be stopped');
    }
  }

  async cleanUpUnused() {
    const liveInputs = await RtmpInput.find({ status: RtmpStatus.Live });
    const now = Date.now();
    for (const input of liveInputs) {
      const records = await RecordSource.find({
        source: input._id,
        status: {
          $in: [TranscodeStatus.Running, TranscodeStatus.Pending],
        },
      });
      if (
        records.filter(record => now - record.updatedAt!.getTime() < 1000 * 60)
          .length > 0
      ) {
        continue;
      }

      for (const record of records) {
        liveHlsLogger.warn(
          'record:',
          record.id,
          ' by source:',
          input.id,
          ' seems to be failed',
        );
        await record.updateOne({
          $set: {
            status: TranscodeStatus.Failed,
          },
        });
      }

      liveHlsLogger.warn('source:', input.id, ' seems to be unused');
      await input.updateOne({
        $set: {
          status: RtmpStatus.Unused,
        },
      });
    }

    const notUpdatedRunningSources = await RecordSource.find({
      status: TranscodeStatus.Running,
      lastManifestAppend: {
        $lte: new Date(now - 1000 * 60 * 2),
      },
    });
    for (const source of notUpdatedRunningSources) {
      liveHlsLogger.warn('record:', source.id, ' seems to be failed');
      await source.updateOne({
        $set: {
          status: TranscodeStatus.Failed,
        },
      });
    }
  }
}

export const liveHlsManager = new LiveHLSManager();
