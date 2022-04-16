import dotenv from 'dotenv';
import path from 'path';
import { app } from 'electron';

export const rootPath = path.join(__dirname, '../../');

export const configPath = app.getPath('userData');

dotenv.config({
  path: path.join(configPath, '.env')
});

export const {
  PORT,
  NODE_ENV,
  WALLET,
  WALLET_API_PORT,
  BEAM_NODE_PORT,
  HTTP_MODE
} = process.env;
