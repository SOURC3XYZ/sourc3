import path from 'path';
import { rootPath, configPath } from '../common';

export const binPath = path.join(rootPath, 'beam-res');
export const cliPath = path.join(binPath, 'cli');
export const nodePath = path.join(binPath, 'node/');
export const walletApiPath = path.join(binPath, 'api');
export const keyPath = path.join(binPath, '/key.txt');

export const walletDBPath = path.join(configPath, 'wallet.db');

export const nodeDBPath = path.join(configPath, 'node.db');

export const ipfsPath = path.join(configPath, 'ipfs-repo');
