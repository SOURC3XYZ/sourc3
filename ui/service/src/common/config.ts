import dotenv from 'dotenv';
import path from 'path';
import { program } from 'commander';

const buildConfig = () => {
  program
    .option('-l, --user_data_loc <string>', 'set root path', './');

  program.parse(process.argv);
  const options = program.opts();
  const { user_data_loc } = options;
  return user_data_loc;
};

export const rootPath = path.join(__dirname, '../../');

export const configPath = buildConfig();

dotenv.config({
  path: path.join(configPath, '.env')
});

export const {
  PORT,
  NODE_ENV,
  WALLET,
  WALLET_API_PORT,
  BEAM_NODE_PORT
} = process.env;