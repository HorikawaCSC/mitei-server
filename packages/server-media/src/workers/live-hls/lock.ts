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
