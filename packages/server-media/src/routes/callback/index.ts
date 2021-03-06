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

import { RtmpInput } from '@mitei/server-models';
import { urlencoded } from 'body-parser';
import { Router } from 'express';
import { RtmpEvent } from '../../types/RtmpEvent';
import { liveHlsLogger } from '../../utils/logging';
import { sleep } from '../../utils/sleep';
import { liveHlsManager } from '../../workers/live-hls';

export const router = Router();

router.use(urlencoded({ extended: true }));
router.post('/rtmp-events', async (req, res) => {
  if (!req.body) {
    return res.status(400).end();
  }
  const event: RtmpEvent = req.body;
  if (
    event.call !== 'publish' &&
    event.call !== 'publish_done' &&
    event.call !== 'play'
  ) {
    return res.status(400).end();
  }

  const source = await RtmpInput.findById(event.name);
  if (!source || !source.id) {
    return res.status(404).end();
  }

  try {
    if (event.call === 'play') {
      return res.status(200).end(); // TODO
    }

    if (event.call === 'publish') {
      res.status(200).end();

      await sleep(500);
      await liveHlsManager.create(source);
    }

    if (event.call === 'publish_done') {
      res.status(200).end();

      await sleep(1000);
      await liveHlsManager.stop(source);
    }
  } catch (e) {
    liveHlsLogger.error(e);
    return res.status(500).end();
  }
});
