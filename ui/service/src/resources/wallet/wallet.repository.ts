import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { BEAM_NODE_PORT, rootPath, WALLET_API_PORT } from '../../common';

let currentProcess:ReturnType<typeof spawn> | undefined;

const binPath = path.join(rootPath, 'beam-res');
const cliPath = path.join(binPath, 'cli/beam-wallet-masternet');
const walletPath = path.join(binPath, 'wallet.db');
const walletApiPath = path.join(binPath, 'api/wallet-api-masternet');

export const deleteFile = (filePath:string) => {
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const readDirFile = async (
  directoryPath: string,
  fileName:string
) => new Promise(
  (resolve) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.log(`Unable to scan directory: ${err}`);
        resolve(false);
      }
      const findedName = files.find((el) => el === fileName);
      return resolve(!!findedName);
    });
  }
);

export const removeWallet = async () => {
  const isWalletExist = await readDirFile(binPath, 'wallet.db');
  if (isWalletExist) {
    return deleteFile(walletPath);
  } return true;
};

export const restoreExistedWallet = (
  seed:string,
  password:string
):Promise<boolean> => new Promise((resolve) => {
  const args = [
    'restore',
    '--wallet_path', binPath,
    '--pass', password,
    '--seed_phrase', seed
  ];
  const childProcess = spawn(cliPath, args, { detached: true });

  childProcess.stdout.on('data', (data:Buffer) => {
    const bufferString = data.toString('utf-8');
    console.log('stdout:', bufferString);
  });

  childProcess.stderr.on('data', (data:Buffer) => {
    const bufferString = data.toString('utf-8');
    console.log('stdout:', bufferString);
    resolve(false);
  });

  childProcess.on('close', (code:number | null) => {
    console.log(`child process exited with code ${code}`);
    resolve(!code);
  });
});

export const runWalletApi = (
  password: string
) => new Promise<boolean>((resolve) => {
  if (currentProcess) currentProcess.kill('SIGKILL');
  const args = [
    '-n', `127.0.0.1:${BEAM_NODE_PORT}`,
    '-p', `${WALLET_API_PORT}`,
    `--pass=${password}`,
    '--use_http=1',
    `--wallet_path=${walletPath}`];
  const childProcess = spawn(walletApiPath, args);

  childProcess.stdout.on('data', (data:string) => {
    console.log(`stdout: ${data}`);
    currentProcess = childProcess;
    resolve(true);
  });

  childProcess.stderr.on('error', (err:string) => {
    console.log(`stderr: ${err}`);
    resolve(false);
  });
});

export const killApiServer = async ():Promise<string> => new Promise(
  (resolve) => {
    if (currentProcess && !currentProcess.killed) {
      currentProcess.on('close', (code:number) => {
        console.log(`child process exited with code ${code}`);
        resolve(`child process exited with code ${code}`);
      });
      currentProcess.kill('SIGKILL');
    } else resolve('child process not active');
  }
);
