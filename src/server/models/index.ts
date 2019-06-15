import { createConnection } from 'typeorm';
import { config } from '../config';
import { FileSource } from './FileSource';
import { RecordSource } from './RecordSource';
import { RtmpSource } from './RtmpSource';
import { Session } from './Session';
import { User } from './User';

const entities = [RtmpSource, RecordSource, FileSource, User, Session];
export const connect = async () => {
  await createConnection({
    type: 'mysql',
    entities,
    logging: false,
    synchronize: true,
    ...config.mysql,
  });
};
