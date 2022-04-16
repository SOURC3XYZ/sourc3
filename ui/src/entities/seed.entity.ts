/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-cycle */
import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn
} from 'typeorm';
import { Repo } from '.';

@Entity({ name: 'seeds' })
export class Seed {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column('varchar', { length: 40 })
    seed: string;

  @OneToMany(() => Repo, (repo) => repo.seedId)
    repos: Repo[];
}
