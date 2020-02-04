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

import {
  Manifest,
  SourceType,
  TranscodedSource,
  TranscodeStatus,
} from '@mitei/server-models';
import { Router } from 'express';
import { config } from '../../../../config';
import {
  generateManifest,
  ManifestInput,
} from '../../../../streaming/hls/manifest';
import { encodeSegmentRef } from '../../../../streaming/hls/segment-ref';

export const router = Router();

router.get('/:sourceId/manifest.m3u8', async (req, res) => {
  const { sourceId } = req.params as Record<string, string>;
  const source = await TranscodedSource.findById(sourceId);

  if (!source) {
    return res.status(404).end('source not found');
  }

  if (source.type === SourceType.File) {
    if (source.status !== TranscodeStatus.Success) {
      return res.status(404).end('source error');
    }
  } else if (source.type === SourceType.Record) {
    if (
      source.status !== TranscodeStatus.Running &&
      source.status !== TranscodeStatus.Success
    ) {
      return res.status(404).end('source error');
    }

    if (
      source.status === TranscodeStatus.Running &&
      source.manifest.length < 2
    ) {
      return res.status(404).end('source is not prepared');
    }
  }

  const items =
    source.type === SourceType.Record &&
    source.status === TranscodeStatus.Running
      ? source.manifest.slice(-4)
      : source.manifest;

  const manifest: ManifestInput = {
    endList: source.status !== TranscodeStatus.Running,
    seqBegin: source.manifest.length - items.length + 1,
    items: items.map((item: Manifest) => ({
      duration: item[2],
      url: `${config.appUrl}/api/ts/${sourceId}/${encodeSegmentRef(
        item[0],
        item[1],
      )}.ts`,
    })),
  };

  res
    .contentType('application/vnd.apple.mpegurl')
    .end(generateManifest(manifest));
});
