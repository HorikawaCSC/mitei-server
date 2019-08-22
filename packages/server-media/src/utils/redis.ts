import * as Redis from 'ioredis';
import { config } from '../config';

export const redis = new Redis({
  ...config.redis,
  lazyConnect: true,
});

export const redisKeys = {
  deviceChallenge: (deviceId: string) => `mitei:devc:${deviceId}`,
};
