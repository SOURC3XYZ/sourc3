import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export const rootPath = path.join(__dirname, '../');

export const configPath = app.getPath('userData');

const envPath = fs.existsSync(path.join(rootPath, '.env')) 
? path.join(rootPath, '.env')
: path.join(rootPath, '../.env');


dotenv.config({
  path: envPath
});

export const {
  PORT,
  NODE_ENV,
  WALLET,
  WALLET_API_PORT,
  BEAM_NODE_PORT,
  HTTP_MODE
} = process.env;
