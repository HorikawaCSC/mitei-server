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

// Queue manager

//@ts-ignore
import * as arena from 'bull-arena';
import { RequestHandler } from 'express';
import { config } from '../config';

export const arenaApp: RequestHandler = arena(
  {
    queues: [
      {
        host: config.redis.host,
        port: config.redis.port,
        type: 'bull',
        name: 'mitei-transcode',
        hostId: 'mitei',
      },
    ],
  },
  {
    basePath: '/arena',
    disableListen: true,
  },
);
