import { Column, Entity } from 'typeorm';
import { TranscodedSource } from './TranscodedSource';

@Entity()
export class FileSource extends TranscodedSource {
  @Column('text')
  name = '';

  @Column('text')
  sourcePath = '';

  @Column('bool')
  sourceAvailable = true;
}
