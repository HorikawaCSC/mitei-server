import { Router } from 'express';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import { config } from '../../../../config';
import { readFileHandle } from '../../../../utils/filehandle';
import { decodeSegmentRef } from '../../../../utils/hls/segment-ref';

export const router = Router();

router.get('/ts/:sourceId([0-9a-f]+)/:segmentRef', async (req, res) => {
  const { sourceId, segmentRef } = req.params as Record<string, string>;

  const sourcePath = resolve(config.paths.source, sourceId, 'stream.m2ts');
  const segmentInfo = decodeSegmentRef(segmentRef.replace(/\.ts$/, ''));

  const fh = await fs.open(sourcePath, 'r');
  const buf = await readFileHandle(fh, segmentInfo.offset, segmentInfo.length);
  await fh.close();

  res
    .contentType('video/M2TS')
    .header('Content-Length', `${segmentInfo.length}`)
    .end(buf);
});

router.get('/tsfill/:segmentRef', async (req, res) => {
  const { segmentRef } = req.params as Record<string, string>;

  const sourcePath = resolve(config.paths.resource, 'filler.m2ts');
  const segmentInfo = decodeSegmentRef(segmentRef.replace(/\.ts$/, ''));

  const fh = await fs.open(sourcePath, 'r');
  const buf = await readFileHandle(fh, segmentInfo.offset, segmentInfo.length);
  await fh.close();

  res
    .contentType('video/M2TS')
    .header('Content-Length', `${segmentInfo.length}`)
    .end(buf);
});
