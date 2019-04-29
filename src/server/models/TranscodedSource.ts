import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

type TranscodeStatus = 'pending' | 'success' | 'failed';

export abstract class TranscodedSource extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('text')
  streamPath = '';

  @Column('blob')
  manifest = Buffer.from([]);

  @Column('varchar', { length: 10 })
  status: TranscodeStatus = 'pending';

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
