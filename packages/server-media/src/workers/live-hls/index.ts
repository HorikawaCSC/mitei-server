import { RtmpInputDocument } from '@mitei/server-models';
import { config } from '../../config';
import { liveHlsLogger } from '../../utils/logging';
import { dropConnection } from './control';
import { lockLiveSource } from './lock';
import { LiveHLSWorker } from './worker';

class LiveHLSManager {
  private workers: Map<string, LiveHLSWorker> = new Map();

  async create(source: RtmpInputDocument) {
    if (!source.id) throw new Error('source must have `id`');

    if (this.workers.size > config.limit.stream) {
      throw new Error('too many streams');
    }

    if (this.workers.has(source.id) || !(await lockLiveSource(source))) {
      liveHlsLogger.warn('Same source worker is still running');
      throw new Error('already broadcasting');
    }

    const worker = new LiveHLSWorker(source);
    this.workers.set(source.id, worker);

    await worker.start();

    liveHlsLogger.debug('source:', source.id, 'started');

    worker.on('end', async (isError: boolean) => {
      if (!source.id) throw new Error('source invalid');
      this.workers.delete(source.id);
      liveHlsLogger.debug('source:', source.id, 'stopped', 'err?:', isError);
      if (isError) {
        await dropConnection(source.id);
      }
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
}

export const liveHlsManager = new LiveHLSManager();
