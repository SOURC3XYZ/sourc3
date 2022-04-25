/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne
} from 'typeorm';
import { Seed } from '.';

@Entity()
export class Repo {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column('varchar', { length: 200 })
    local!: string;

  @Column('varchar')
    remote!: string;

  @Column('varchar')
    name!: string;

  @ManyToOne(() => Seed, (seed) => seed.repos)
    seedId!: Seed;
}
