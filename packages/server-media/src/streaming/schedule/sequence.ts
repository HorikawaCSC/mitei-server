import { schedulerLogger } from '../../utils/logging';
import { redis } from '../../utils/redis';

const SEQUENCE_EXPIRE = 20;
const key = (scheduleId: string) => `mitei:seq:${scheduleId}`;
export const getSequenceStart = async (
  scheduleId: string,
  reExpire = false,
) => {
  const seq = await redis.get(key(scheduleId));
  if (seq !== null) {
    const seqNum = Number(seq);
    if (isNaN(seqNum)) throw new Error('invalid cache');
    if (reExpire) await redis.expire(key(scheduleId), SEQUENCE_EXPIRE);
    return seqNum;
  }
  return null;
};

export const setSequenceStart = async (scheduleId: string, seqId: number) => {
  const result = await redis.set(
    key(scheduleId),
    `${seqId}`,
    'EX',
    SEQUENCE_EXPIRE,
    'NX',
  );
  if (!result) {
    schedulerLogger.debug('other server locked seq key, retry');

    const actual = await getSequenceStart(scheduleId);
    if (actual === null)
      throw new Error('other server locked key and failed to retry');

    return actual;
  }
  return seqId;
};
