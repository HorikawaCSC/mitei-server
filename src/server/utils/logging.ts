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
export const express = log4js.connectLogger(log4js.getLogger('access'), {
  level: 'debug',
});
