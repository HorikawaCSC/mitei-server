import { RtmpInputDocument } from '../../models/RtmpInput';
import { liveHlsLogger } from '../../utils/logging';
import { LiveHLSWorker } from './worker';

class LiveHLSManager {
  private workers: Map<string, LiveHLSWorker> = new Map();

  async create(source: RtmpInputDocument) {
    if (!source.id) throw new Error('source must have `id`');
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
}

export const liveHlsManager = new LiveHLSManager();
