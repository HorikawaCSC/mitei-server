import { Router } from 'express';
import { config } from '../../../../config';
import { FileSource } from '../../../../models/FileSource';
import { RecordSource } from '../../../../models/RecordSource';
import { Manifest, TranscodeStatus } from '../../../../models/TranscodedSource';
import {
  generateManifest,
  ManifestInput,
} from '../../../../utils/hls/manifest';
import { encodeSegmentRef } from '../../../../utils/hls/segment-ref';

export const router = Router();

router.get('/file/:sourceId/manifest.m3u8', async (req, res) => {
  const { sourceId } = req.params as Record<string, string>;
  const source = await FileSource.findById(sourceId);

  if (!source || source.status !== TranscodeStatus.Success) {
    return res.status(400).end('source not found');
  }

  const manifest: ManifestInput = {
    endList: true,
    seqBegin: 1,
    items: source.manifest.map((item: Manifest) => ({
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

router.get('/record/:sourceId/manifest.m3u8', async (req, res) => {
  const { sourceId } = req.params as Record<string, string>;
  const source = await RecordSource.findById(sourceId);

  if (
    !source ||
    (source.status !== TranscodeStatus.Running &&
      source.status !== TranscodeStatus.Success)
  ) {
    return res.status(400).end('source not found');
  }

  const latestItems =
    source.status === TranscodeStatus.Running
      ? source.manifest.slice(-4)
      : source.manifest;

  if (latestItems.length < 4) {
    return res.status(400).end('source not found (not enough)');
  }

  const manifest: ManifestInput = {
    endList: source.status !== TranscodeStatus.Running,
    seqBegin: source.manifest.length - latestItems.length + 1,
    items: latestItems.map((item: Manifest) => ({
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
