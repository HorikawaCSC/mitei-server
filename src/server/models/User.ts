import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export type UserKind = 'admin' | 'normal';
export type AuthType = 'twitter';

@Entity()
@Unique(['userId', 'type'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('bigint')
  userId = '0';

  @Column('varchar', { length: 128 })
  token = '';

  @Column('varchar', { length: 128 })
  tokenSecret = '';

  @Column('varchar', { length: 64 })
  screenName = '';

  @Column('varchar', { length: 96 })
  iconUrl = '';

  @Column('varchar', { length: 8 })
  kind: UserKind = 'normal';

  @Column('varchar', { length: 8 })
  type: AuthType = 'twitter';
}
