import * as Redis from 'ioredis';
import { config } from '../config';

export const redis = new Redis({
  ...config.redis,
  lazyConnect: true,
});
