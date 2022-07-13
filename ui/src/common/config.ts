/* eslint-disable import/no-extraneous-dependencies */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export const rootPath = path.join(__dirname, '../../');

export const configPath = app.getPath('userData');

export const IPFS_BOOTSRAP = '12D3KooWMvQRyfF7y7pUvgPXXyEWeGofU2sWDBWt3LDzs79v9dCR';

const envPath = fs.existsSync(path.join(rootPath, '.env'))
  ? path.join(rootPath, '.env')
  : path.join(rootPath, '../.env');

dotenv.config({
  path: envPath
});

export const PORT = 5001
export const NODE_ENV = "development"
export const WALLET = "http://127.0.0.1:9100/api/wallet"
export const WALLET_API_PORT = 9100
export const BEAM_NODE_PORT = 9105
export const HTTP_MODE = 0
