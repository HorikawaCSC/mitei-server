import { Router } from 'express';

import { router as sourceRouter } from './stream/manifest/source';
import { router as tsRouter } from './stream/segment';

export const router = Router();

router.use('/ts', tsRouter);
router.use('/hls/source', sourceRouter);
