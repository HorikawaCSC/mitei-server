import { Column, Entity } from 'typeorm';
import { TranscodedSource } from './TranscodedSource';

@Entity()
export class FileSource extends TranscodedSource {
  @Column('text')
  name = '';

  @Column('varchar', { length: 10 })
  sourceExtension = '';

  @Column('bool')
  sourceAvailable = true;

  @Column('text')
  error = '';

  @Column('int')
  sourceWidth = 0;

  @Column('int')
  sourceHeight = 0;
}
