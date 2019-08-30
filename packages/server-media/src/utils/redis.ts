import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Redis from 'ioredis';
import { config } from '../config';

export const redis = new Redis({
  ...config.redis,
  lazyConnect: true,
});

export const redisKeys = {
  deviceChallenge: (deviceId: string) => `mitei:devc:${deviceId}`,
  viewerRequest: (deviceId: string) => `mitei:vreq:${deviceId}`,
  viewerMetrics: (deviceId: string) => `mitei:vmetr:${deviceId}`,
};

const pubsubConnection = new Redis({
  ...config.redis,
  lazyConnect: true,
});

export const connectRedis = async () => {
  await pubsubConnection.connect();
  await redis.connect();
};

export const redisPubSub = new RedisPubSub({
  subscriber: pubsubConnection,
  publisher: redis,
});
