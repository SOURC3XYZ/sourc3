import { ConnectionOptions } from 'typeorm';
import path from 'path';
import { configPath } from './config';
import { Repo, Seed } from '../entities';

export const ormConfig: ConnectionOptions = {
  type: 'sqlite',
  database: path.join(configPath, 'repos.db'),
  entities: [Seed, Repo],
  synchronize: true
};
