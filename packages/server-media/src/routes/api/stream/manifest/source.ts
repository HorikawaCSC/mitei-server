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
} from '../../../../utils/hls/manifest';
import { encodeSegmentRef } from '../../../../utils/hls/segment-ref';

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
