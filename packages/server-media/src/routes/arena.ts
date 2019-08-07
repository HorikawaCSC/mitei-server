// Queue manager

//@ts-ignore
import * as arena from 'bull-arena';
import { RequestHandler } from 'express';
import { config } from '../config';

export const arenaApp: RequestHandler = arena(
  {
    queues: [
      {
        host: config.redis.host,
        port: config.redis.port,
        type: 'bull',
        name: 'mitei-transcode',
        hostId: 'mitei',
      },
    ],
  },
  {
    basePath: '/arena',
    disableListen: true,
  },
);
