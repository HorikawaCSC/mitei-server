import { Column, Entity } from 'typeorm';
import { TranscodedSource } from './TranscodedSource';

export type SourceStatus = 'uploading' | 'avail' | 'deleted';
@Entity()
export class FileSource extends TranscodedSource {
  @Column('text')
  name = '';

  @Column('varchar', { length: 10 })
  sourceExtension = '';

  @Column('varchar', { length: 10 })
  sourceStatus: SourceStatus = 'uploading';

  @Column('text')
  error = '';

  @Column('int')
  sourceWidth = 0;

  @Column('int')
  sourceHeight = 0;
}
