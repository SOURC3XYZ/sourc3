import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import { BEAM_NODE_PORT, WALLET_API_PORT } from '../../common';
import {
  binPath,
  cliPath,
  walletApiPath,
  walletPath
} from '../../utils';
import { runSpawnProcess } from '../../utils/process-handlers';

let currentProcess:ReturnType<typeof spawn> | undefined;

const success = /Start server on/i;
const error = /Please check your password/i;
const ownerKeyReg = /Owner Viewer key/i;

export function deleteFile(filePath:string) {
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export function readDirFile(
  directoryPath: string,
  fileName:string
) {
  return new Promise(
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
}

export function killApiServer():Promise<string> {
  return new Promise(
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
}

export function setCurrentProcess(process: ChildProcess) {
  if (currentProcess && !currentProcess.killed) {
    currentProcess.kill('SIGKILL');
    currentProcess.on('close', (code: number) => {
      console.log(`child process exited with code ${code}`);
      setCurrentProcess(process);
    });
  } else currentProcess = process;
}

export async function removeWallet() {
  const isWalletExist = await readDirFile(binPath, 'wallet.db');
  if (isWalletExist) {
    return deleteFile(walletPath);
  } return true;
}

export function exportOwnerKey(
  password:string
):Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      'export_owner_key',
      '--pass', password,
      '--wallet_path', walletPath
    ];

    const onData = (data:Buffer) => {
      const bufferString = data.toString('utf-8');
      console.log(`stdout: ${bufferString}`);

      if (bufferString.match(ownerKeyReg)) {
        const key = bufferString
          .replace('Owner Viewer key:', '')
          .trim();
        resolve(key);
      }
      if (bufferString.match(error)) {
        reject(new Error('bad pass'));
      }
    };

    const onClose = (code:number | null) => {
      console.log(`child process exited with code ${code}`);
    };

    runSpawnProcess({
      path: cliPath, args, onData, onClose
    });
  });
}

export function restoreExistedWallet(
  seed:string,
  password:string
):Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      'restore',
      '--wallet_path', binPath,
      '--pass', password,
      '--seed_phrase', seed
    ];

    const onData = (data:Buffer) => {
      const bufferString = data.toString('utf-8');
      console.log('stdout:', bufferString);
    };

    const onClose = (code:number | null) => {
      console.log(`child process exited with code ${code}`);
      if (Number(code) > 0) {
        return reject(new Error(
          'wrong seed-phrase or wallet api is running now'
        ));
      }
      return resolve('wallet successfully restored');
    };

    runSpawnProcess({
      path: cliPath,
      detached: true,
      args,
      onData,
      onClose
    });
  });
}

export function runWalletApi(
  password: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      '-n', `127.0.0.1:${BEAM_NODE_PORT}`,
      '-p', `${WALLET_API_PORT}`,
      `--pass=${password}`,
      '--use_http=1',
      `--wallet_path=${walletPath}`
    ];

    const onData = (data:Buffer) => {
      const bufferString = data.toString('utf-8');
      console.log(`stdout: ${bufferString}`);
      if (bufferString.match(success)) {
        resolve('wallet api started successfully');
      }
      if (bufferString.match(error)) {
        killApiServer()
          .then(() => reject(new Error('something went wrong')));
      }
    };

    runSpawnProcess({
      path: walletApiPath,
      args,
      onData,
      setCurrentProcess
    });
  });
}
