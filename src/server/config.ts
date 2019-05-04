import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  appPort: Number(process.env.APP_PORT || 3000),
  callbackPort: Number(process.env.CALLBACK_PORT || 3001),
  streaming: {
    rtmpAddress: process.env.NGINX_RTMP_ADDR || '',
    rtmpClientEndpoint: process.env.NGINX_RTMP_ENDPOINT || '',
  },
  paths: {
    source: process.env.SOURCES_DIR || '/app/data/source',
    temp: process.env.UPLOAD_TEMP_DIR || '/app/data/tmp',
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: Number(process.env.REDIS_PORT || 6379),
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'mysql',
    port: Number(process.env.MYSQL_PORT || 3306),
    username: process.env.MYSQL_USERNAME || 'mitei',
    password: process.env.MYSQL_PASSWORD || 'mitei',
    database: process.env.MYSQL_DATABASE || 'mitei',
  },
  limit: {
    stream: Number(process.env.MAX_STREAM || 10),
  },
  prod: process.env.NODE_ENV === 'production',
};
