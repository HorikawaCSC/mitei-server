import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TranscodeStatus = 'pending' | 'success' | 'failed';

export abstract class TranscodedSource extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('blob')
  manifest = Buffer.from([]);

  @Column('varchar', { length: 10 })
  status: TranscodeStatus = 'pending';

  @Column('double')
  duration = 0;

  @Column('blob', { nullable: true })
  thumbnail: Buffer | null = null;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
