import path from 'path';
import { rootPath } from '../common';

export const binPath = path.join(rootPath, 'beam-res');
export const cliPath = path.join(binPath, 'cli');
export const nodePath = path.join(binPath, 'node/');
export const walletPath = path.join(binPath, 'wallet.db');
export const walletApiPath = path.join(binPath, 'api');
export const keyPath = path.join(binPath, '/key.txt');
