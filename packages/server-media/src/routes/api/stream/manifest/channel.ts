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

import { Channel } from '@mitei/server-models';
import { Router } from 'express';
import { generateManifest } from '../../../../streaming/hls/manifest';
import { createScheduleResolver } from '../../../../streaming/schedule/resolver';

export const router = Router();

router.get('/:channelId/manifest.m3u8', async (req, res) => {
  try {
    const { channelId } = req.params as Record<string, string>;
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).end('channel not found');
    }

    const scheduler = await createScheduleResolver(channel);
    const manifest = await scheduler.createManifest();
    if (!manifest) {
      return res.status(404).end('channel not found');
    }

    res
      .contentType('application/vnd.apple.mpegurl')
      .end(generateManifest(manifest));
  } catch (err) {
    res.status(err.status || 500).end(err.message || 'internal error');
  }
});
