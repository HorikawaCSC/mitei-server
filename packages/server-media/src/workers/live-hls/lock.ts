import { RtmpInputDocument } from '@mitei/server-models';
import { redis } from '../../utils/redis';

const key = (inputId: string) => `mitei:rtmp:${inputId}`;
const LIVE_EXPIRE = 15;

export const lockLiveSource = async (input: RtmpInputDocument) => {
  const result = await redis.set(key(input.id), '1', 'EX', LIVE_EXPIRE, 'NX');
  return result;
};

export const unlockLiveSource = async (input: RtmpInputDocument) => {
  const result = await redis.del(key(input.id));
  return result;
};

export const checkLockLiveSource = async (id: string) => {
  return !!(await redis.exists(key(id)));
};
