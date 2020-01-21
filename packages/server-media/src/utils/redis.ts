import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Redis from 'ioredis';
import { config } from '../config';

export const redis = new Redis({
  ...config.redis,
  lazyConnect: true,
});

export const redisKeys = {
  deviceChallenge: (deviceId: string) => `mitei:devc:${deviceId}`,
  viewerUpdate: (deviceId: string) => `mitei:vupd:${deviceId}`,
  viewerUpdateAll: () => `mitei:vupd:*`,
  viewerOnline: (deviceId: string) => `mitei:vonl:${deviceId}`,
  viewerState: (deviceId: string) => `mitei:vstate:${deviceId}`,
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

export const memorizedPubSubIterator = <T>(
  id: string,
  expire: number,
  options?: {},
): AsyncIterable<T> & AsyncIterator<T> => {
  const iter: AsyncIterator<T> = redisPubSub.asyncIterator(id, options);
  let initialValueSent = false;
  const memoryKey = `${id}:initial`;
  const next = async () => {
    const { value, done } = await iter.next();
    await redis.set(memoryKey, JSON.stringify(value), 'EX', expire);
    return { value, done };
  };
  const newIter = {
    ...iter,
    async next() {
      if (initialValueSent) return next();

      const initial = await redis.get(memoryKey);
      initialValueSent = true;
      if (initial) {
        return {
          done: false,
          value: JSON.parse(initial),
        };
      } else {
        return next();
      }
    },
  };
  return {
    ...newIter,
    [Symbol.asyncIterator]() {
      return newIter;
    },
  };
};
