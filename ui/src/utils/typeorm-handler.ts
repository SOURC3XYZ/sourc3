import { createConnection } from 'typeorm';
import { ormConfig } from '../common';

const connectToDB = async () => {
  // if (!isExistsSync(configPath, 'repos.db')) {
  //   fileCreate(path.join(configPath, 'repos.db'));
  // }
  await createConnection(ormConfig);
};

export const tryBDConnect = async (callback: () => void): Promise<void> => {
  await connectToDB();
  callback();
};
