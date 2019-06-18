import * as Queue from 'bull';
import { config } from '../../config';
import { FileSource } from '../../models/FileSource';
import { Transcoder } from './transcoder';

export interface TranscodeWorkerParam {
  sourceId: string;
  probeMode: boolean;
  transcodeArgs: string;
}

class TranscodeWorker {
  private queue = new Queue<TranscodeWorkerParam>('mitei-transcode', {
    redis: config.redis,
  });

  constructor() {
    this.setupQueue();
  }

  private setupQueue() {
    this.queue.process(
      config.limit.transcode,
      async job => await this.processJob(job),
    );
  }

  private async processJob(job: Queue.Job<TranscodeWorkerParam>) {
    const jobParams = job.data;
    const transcoder = new Transcoder(jobParams);

    await transcoder.lookup();

    if (jobParams.probeMode) {
      await transcoder.probe();
      return;
    } else if (!transcoder.transcodable) {
      throw new Error('source is not able to transcode');
    }

    transcoder.on('duration', () => {
      job.progress(transcoder.progress);
    });

    await transcoder.transcode();
  }

  enqueue(source: FileSource, params: Omit<TranscodeWorkerParam, 'sourceId'>) {
    if (!source.id) throw new Error('source invalid');
    if (source.sourceStatus !== 'avail') throw new Error('source unavailable');

    if (params.probeMode) {
      if (source.sourceWidth > 0) throw new Error('already probed');
    } else {
      if (source.sourceWidth === 0) throw new Error('not probed');
    }

    this.queue.add({
      ...params,
      sourceId: source.id,
    });
  }

  async getStatus() {
    const status = await this.queue.getJobCounts();

    return status;
  }

  async getJobProgress(jobId: string) {
    const job = await this.queue.getJob(jobId);
    if (!job) return -1;

    return ((await job.progress(undefined)) as unknown) as number;
  }
}

export const transcodeWorker = new TranscodeWorker();
