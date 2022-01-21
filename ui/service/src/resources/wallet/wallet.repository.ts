import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { BEAM_NODE_PORT, rootPath, WALLET_API_PORT } from '../../common';

let currentProcess:ReturnType<typeof spawn> | undefined;

const binPath = path.join(rootPath, 'beam-res');
const cliPath = path.join(binPath, 'cli/beam-wallet-masternet');
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
  const walletPath = [binPath, 'wallet.db'] as const;
  const isWalletExist = await readDirFile(...walletPath);
  if (isWalletExist) {
    return deleteFile(path.join(...walletPath));
  } return true;
};

export const restoreExistedWallet = (
  seed:string,
  password:string
):Promise<boolean> => new Promise((resolve) => {
  const childProcess = spawn(cliPath, [
    'restore',
    '--wallet_path', binPath,
    '--pass', password,
    '--seed_phrase', seed
  ]);

  childProcess.stdout.on('data', (data:string) => {
    console.log(`stdout: ${data}`);
  });

  childProcess.stderr.on('data', (data:string) => {
    console.log(`error: ${data}`);
  });

  childProcess.on('close', (code:number) => {
    console.log(`child process exited with code ${code}`);
    resolve(code === 0);
  });
});

export const runWalletApi = (
  password: string
) => new Promise<boolean>((resolve) => {
  const walletPath = path.join(binPath, 'wallet.db');
  const childProcess = spawn(walletApiPath, [
    '-n', `127.0.0.1:${BEAM_NODE_PORT}`,
    '-p', `${WALLET_API_PORT}`,
    `--pass=${password}`,
    '--use_http=1',
    `--wallet_path=${walletPath}`]);

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
      currentProcess.kill();
    } else resolve('child process not active');
  }
);
