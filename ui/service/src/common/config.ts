import dotenv from 'dotenv';
import path from 'path';

export const rootPath = path.join(__dirname, '../../');

dotenv.config({
  path: path.join(rootPath, '.env')
});

export const {
  PORT,
  NODE_ENV,
  WALLET,
  WALLET_API_PORT,
  BEAM_NODE_PORT
} = process.env;
