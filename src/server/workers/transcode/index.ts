import * as Queue from 'bull';
import { config } from '../../config';
import {
  FileSource,
  FileSourceDocument,
  SourceStatus,
} from '../../models/FileSource';
import { TranscodeStatus } from '../../models/TranscodedSource';
import { TranscodePresetDocument } from '../../models/TranscodePreset';
import { transcodeLogger } from '../../utils/logging';
import { Transcoder } from './transcoder';

export interface TranscodeWorkerParam {
  sourceId: string;
  probeMode: boolean;
  presetId: string;
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

    this.queue.on('failed', async (job, err) => {
      transcodeLogger.error('job', job.id, 'failed', err, job.stacktrace);

      await FileSource.updateOne(
        {
          _id: job.data.sourceId,
        },
        {
          $set: {
            status: TranscodeStatus.Failed,
            error: err.message,
          },
        },
      );
    });
  }

  private async processJob(job: Queue.Job<TranscodeWorkerParam>) {
    const jobParams = job.data;
    const transcoder = new Transcoder(jobParams);

    await transcoder.lookup();

    if (jobParams.probeMode) {
      await transcoder.probe();
      return;
    } else if (!transcoder.transcodable) {
      transcodeLogger.warn(
        'source',
        jobParams.sourceId,
        'is not able to transcode',
      );
      await job.remove();
      return;
    }

    transcoder.on('duration', () => {
      job.progress(transcoder.progress);
    });

    await transcoder.transcode();
  }

  async getTranscodeJob(source: FileSourceDocument) {
    return await this.queue.getJob(`t:${source.id}`);
  }

  async getProbeJob(source: FileSourceDocument) {
    return await this.queue.getJob(`p:${source.id}`);
  }

  async getTranscodeJobProgress(source: FileSourceDocument) {
    const job = await this.getTranscodeJob(source);
    if (!job) return null;

    return ((await job.progress(undefined)) as unknown) as number;
  }

  async enqueueTranscode(
    source: FileSourceDocument,
    preset: TranscodePresetDocument,
  ) {
    if (source.source.status !== SourceStatus.Available)
      throw new Error('source unavailable');

    if (await this.getTranscodeJob(source)) throw new Error('already queued');

    return await this.queue.add(
      {
        probeMode: false,
        presetId: preset.id,
        sourceId: source.id,
      },
      {
        jobId: `t:${source.id}`,
        removeOnFail: true,
      },
    );
  }

  async enqueueProbe(source: FileSourceDocument) {
    if (source.source.status !== SourceStatus.Available)
      throw new Error('source unavailable');

    if (await this.getProbeJob(source)) throw new Error('already queued');

    if (source.source.width) throw new Error('already probed');

    return await this.queue.add(
      {
        sourceId: source.id,
        presetId: '',
        probeMode: true,
      },
      {
        jobId: `p:${source.id}`,
        removeOnFail: true,
      },
    );
  }

  async getStatus() {
    const status = await this.queue.getJobCounts();

    return status;
  }
}

export const transcodeWorker = new TranscodeWorker();
