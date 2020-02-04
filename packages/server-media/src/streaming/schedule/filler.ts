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

import { FillerControl, Manifest } from '@mitei/server-models';
import { schedulerLogger } from '../../utils/logging';
import { redis } from '../../utils/redis';

const FILLER_EXPIRE = 60;
const key = (channelId: string) => `mitei:chfill:${channelId}`;

type FillerDataRedis = {
  m: FillerControl;
  d: Array<{
    i: string;
    m: Manifest[];
  }>;
};

type FillerData = {
  fillerControl: FillerControl;
  fillerSources: Array<{
    id: string;
    manifest: Manifest[];
  }>;
};

export const getChannelFillerList = async (
  channelId: string,
  reExpire = false,
): Promise<FillerData | null> => {
  const fillers = await redis.get(key(channelId));
  if (fillers !== null) {
    const fillersData: FillerDataRedis = JSON.parse(fillers);
    if (reExpire) await redis.expire(key(channelId), FILLER_EXPIRE);

    return {
      fillerControl: fillersData.m,
      fillerSources: fillersData.d.map(data => ({
        id: data.i,
        manifest: data.m,
      })),
    };
  }
  return null;
};

export const setChannelFillerList = async (
  channelId: string,
  data: FillerData,
) => {
  const fillersData: FillerDataRedis = {
    m: data.fillerControl,
    d: data.fillerSources.map(filler => ({
      i: filler.id,
      m: filler.manifest,
    })),
  };
  const result = await redis.set(
    key(channelId),
    JSON.stringify(fillersData),
    'EX',
    FILLER_EXPIRE,
    'NX',
  );
  if (!result) {
    schedulerLogger.debug('filler: other server locked seq key, retry');

    const actual = await getChannelFillerList(channelId);
    if (actual === null)
      throw new Error('filler: other server locked key and failed to retry');

    return actual;
  }

  schedulerLogger.debug('filler cache stored');
  return data;
};
