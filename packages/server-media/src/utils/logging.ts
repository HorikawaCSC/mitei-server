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

import * as log4js from 'log4js';
import { config } from '../config';

log4js.configure({
  appenders: {
    console: {
      type: 'console',
    },
  },
  categories: {
    default: {
      appenders: ['console'],
      level: config.prod ? 'info' : 'debug',
    },
    access: {
      appenders: ['console'],
      level: 'info',
    },
  },
});

export const system = log4js.getLogger('system');
export const liveHlsLogger = log4js.getLogger('livehls');
export const transcodeLogger = log4js.getLogger('transcode');
export const authLogger = log4js.getLogger('auth');
export const schedulerLogger = log4js.getLogger('scheduler');
export const express = log4js.connectLogger(log4js.getLogger('access'), {
  level: 'debug',
});
