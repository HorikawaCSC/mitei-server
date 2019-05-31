import { urlencoded } from 'body-parser';
import { Router } from 'express';
import { RtmpSource } from '../../models/RtmpSource';
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

  const source = await RtmpSource.findOne(event.name);
  if (!source || !source.id) {
    return res.status(404).end();
  }
  try {
    if (event.call === 'play') {
      return res.status(200).end(); // TODO
    }

    if (event.call === 'publish') {
      await liveHlsManager.create(source);
      return res.status(200).end();
    }

    if (event.call === 'publish_done') {
      res.status(200).end();

      await sleep(2000);
      await liveHlsManager.stop(source);
    }
  } catch (e) {
    liveHlsLogger.error(e);
    return res.status(500).end();
  }
});
