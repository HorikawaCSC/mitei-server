import { createConnection } from 'typeorm';
import { config } from '../config';
import { FileSource } from './FileSource';
import { RecordSource } from './RecordSource';
import { RtmpSource } from './RtmpSource';

const entities = [RtmpSource, RecordSource, FileSource];
export const connect = async () => {
  await createConnection({
    type: 'mysql',
    entities,
    logging: false,
    synchronize: true,
    ...config.mysql,
  });
};
