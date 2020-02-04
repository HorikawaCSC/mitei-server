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

import { ViewerDeviceResolvers } from '../../generated/graphql';
import {
  getElapsed,
  getMessage,
  getPlayingContent,
  getState,
} from '../../streaming/viewer/state';
import { redis, redisKeys } from '../../utils/redis';

export const viewerDeviceResolvers: ViewerDeviceResolvers = {
  online: async device => {
    const exists = await redis.exists(redisKeys.viewerOnline(device.id));
    return !!exists;
  },
  state: async device => {
    return await getState(device.id);
  },
  message: async device => {
    return await getMessage(device.id);
  },
  elapsed: async device => {
    return await getElapsed(device.id);
  },
  playingContent: async device => {
    return await getPlayingContent(device.id);
  },
};
