import { spawn } from 'child_process';
import fs from 'fs';
import { BEAM_NODE_PORT, WALLET_API_PORT } from '../../common';
import {
  binPath,
  cliPath,
  walletApiPath,
  walletPath
} from '../../utils';

let currentProcess:ReturnType<typeof spawn> | undefined;

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

export const exportOwnerKey = async (
  password:string,
  resolve: (key: string | null) => void
) => {
  const childProcess = spawn(cliPath, [
    'export_owner_key',
    '--pass', password,
    '--wallet_path', walletPath
  ]);

  const ownerKeyBuffer = /Owner Viewer key/i;

  childProcess.stdout.on('data', async (data:Buffer) => {
    const bufferString = data.toString('utf-8');
    console.log(`stdout: ${bufferString}`);
    if (bufferString.match(ownerKeyBuffer)) {
      const key = bufferString.replace('Owner Viewer key:', '').trim();
      return resolve(key);
    } return undefined;
  });
  childProcess.on('close', (code:number | null) => {
    console.log(`child process exited with code ${code}`);
    if (code) { return resolve(null); }
    return undefined;
  });
};

export const restoreExistedWallet = (
  seed:string,
  password:string,
  resolve: (isOk: boolean) => void
) => {
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

  childProcess.on('close', async (code:number | null) => {
    console.log(`child process exited with code ${code}`);
    resolve(!code);
  });
};

export const runWalletApi = async (
  password: string,
  resolve: (isOk: boolean) => void
) => {
  if (currentProcess && !currentProcess.killed) {
    currentProcess.kill('SIGKILL');
    currentProcess.on('close', (code: number) => {
      console.log(`child process exited with code ${code}`);
      runWalletApi(password, resolve);
    });
  } else {
    const success = /Start server on/i;
    const error = /Applying PRAGMA cipher_migrate.../i;
    const args = [
      '-n', `127.0.0.1:${BEAM_NODE_PORT}`,
      '-p', `${WALLET_API_PORT}`,
      `--pass=${password}`,
      '--use_http=1',
      `--wallet_path=${walletPath}`
    ];
    const childProcess = spawn(walletApiPath, args);
    currentProcess = childProcess;

    childProcess.stdout.on('data', (data:Buffer) => {
      const bufferString = data.toString('utf-8');
      console.log(`stdout: ${bufferString}`);

      if (bufferString.match(success)) {
        resolve(true);
        childProcess.on('close', (code: number) => {
          console.log(`child process exited with code ${code}`);
        });
      }
      if (bufferString.match(error)) {
        childProcess.kill('SIGKILL');
        childProcess.on('close', (code: number) => {
          console.log(`child process exited with code ${code}`);
          resolve(false);
        });
      }
    });

    childProcess.stderr.on('error', (err:string) => {
      console.log(`stderr: ${err}`);
      resolve(false);
    });
  }
};

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
