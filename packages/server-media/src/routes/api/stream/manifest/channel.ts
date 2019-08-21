import { Channel } from '@mitei/server-models';
import { Router } from 'express';
import { generateManifest } from '../../../../utils/hls/manifest';
import { createScheduleResolver } from '../../../../utils/schedule/resolver';

export const router = Router();

router.get('/:channelId/manifest.m3u8', async (req, res) => {
  try {
    const { channelId } = req.params as Record<string, string>;
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).end('channel not found');
    }

    const scheduler = await createScheduleResolver(channel);
    res
      .contentType('application/vnd.apple.mpegurl')
      .end(generateManifest(await scheduler.createManifest()));
  } catch (err) {
    res.status(500).end(err.message || 'internal error');
  }
});
