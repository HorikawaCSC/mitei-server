import { RtmpSource } from '../../models/RtmpSource';
import { liveHlsLogger } from '../../utils/logging';
import { LiveHLSWorker } from './worker';

class LiveHLSManager {
  private workers: Map<string, LiveHLSWorker> = new Map();

  async create(source: RtmpSource) {
    if (!source.id) throw new Error('source must have `id`');
    if (this.workers.has(source.id)) {
      liveHlsLogger.warn('Same source worker is still alive, trying to stop');
      await this.stop(source);
    }

    const worker = new LiveHLSWorker(source);
    this.workers.set(source.id, worker);
    await worker.start();
    liveHlsLogger.debug('LiveHLSWorker', source.id, 'started');
    worker.on('end', () => {
      if (!source.id) throw new Error('source invalid');
      this.workers.delete(source.id);
      liveHlsLogger.debug('LiveHLSWorker', source.id, 'stopped');
    });

    const record = worker.getRecord();
    if (!record) throw new Error('worker does not start correctly');
    return worker;
  }

  async stop(source: RtmpSource) {
    if (!source.id) throw new Error('source must have `id`');
    if (this.workers.has(source.id)) {
      await this.workers.get(source.id)!.tryStop();
    } else {
      liveHlsLogger.debug('ffmpeg seemed to be stopped');
    }
  }
}

export const liveHlsManager = new LiveHLSManager();
