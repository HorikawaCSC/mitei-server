import { Router } from 'express';

import { router as channelRouter } from './stream/manifest/channel';
import { router as sourceRouter } from './stream/manifest/source';
import { router as tsRouter } from './stream/segment';

export const router = Router();

router.use((_req, res, next) => {
  res.setHeader('access-control-allow-origin', '*');
  next();
});

router.use('/', tsRouter);
router.use('/source', sourceRouter);
router.use('/channel', channelRouter);
