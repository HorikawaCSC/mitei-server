import { Column, Entity } from 'typeorm';
import { TranscodedSource } from './TranscodedSource';

@Entity()
export class RecordSource extends TranscodedSource {
  @Column('text')
  name = '';

  @Column('varchar', { length: 48 })
  source = '';
}
