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
