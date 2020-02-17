import { TranscodedSource } from '@mitei/server-models';
import { Router } from 'express';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { config } from '../../../config';
import { thumbnailWorker } from '../../../workers/thumbnail';

export const router = Router();

router.get('/:sourceId', async (req, res) => {
  if (!req.isAuthenticated()) return;

  const { sourceId }: { sourceId?: string } = req.params;
  if (!sourceId) return res.status(400).end();

  if (existsSync(`${config.paths.source}/${sourceId}/thumb.jpg`)) {
    return res.sendFile(
      resolve(`${config.paths.source}/${sourceId}/thumb.jpg`),
    );
  } else {
    return res.status(404).end();
  }
});

router.post('/:sourceId', async (req, res) => {
  if (!req.isAuthenticated()) return;

  const { sourceId }: { sourceId?: string } = req.params;
  if (!sourceId) return res.status(400).end();

  const source = await TranscodedSource.findById(sourceId);
  if (!source) return res.status(404).end();

  if (await thumbnailWorker.getJob(source)) {
    return res.status(400).end('already queued');
  }

  await thumbnailWorker.enqueue(source);

  res.status(200).end('ok');
});
