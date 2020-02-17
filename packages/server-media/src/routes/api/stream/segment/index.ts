/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import { config } from '../../../../config';
import { decodeSegmentRef } from '../../../../streaming/hls/segment-ref';
import { readFileHandle } from '../../../../utils/filehandle';

export const router = Router();

router.get('/ts/:sourceId([0-9a-f]+)/:segmentRef', async (req, res) => {
  const { sourceId, segmentRef } = req.params as Record<string, string>;

  const sourcePath = resolve(config.paths.source, sourceId, 'stream.mts');
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
