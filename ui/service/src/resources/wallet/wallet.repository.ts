/* eslint-disable consistent-return */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-restricted-syntax */
import { execFile, ChildProcess } from 'child_process';
import fs from 'fs';
import { BEAM_NODE_PORT, WALLET_API_PORT } from '../../common';
import {
  cliPath,
  getExecutableFile,
  limitStr,
  nodeDBPath,
  nodePath,
  walletApiPath,
  walletDBPath
} from '../../utils';
import { runSpawnProcess } from '../../utils/process-handlers';

let currentProcess: ChildProcess | undefined;

const success = /Start server on/i;
const error = /Please check your password/i;
const ownerKeyReg = /Owner Viewer key/i;
const walletRestoreSuccess = /generated:/i;
const walletRestoreError = /provide a valid seed phrase for the wallet./i;

export function checkRunningApi() {
  return !!(currentProcess && !currentProcess.killed);
}

export function deleteFile(filePath: string) {
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
  fileName: string
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

export function killApiServer(): Promise<string> {
  return new Promise(
    (resolve) => {
      if (currentProcess && !currentProcess.killed) {
        currentProcess.on('close', (code: number) => {
          console.log(`child process exited with code ${code}`);
          resolve(`child process exited with code ${code}`);
        });
        currentProcess.kill('SIGKILL');
      } else resolve('child process not active');
    }
  );
}

export function setCurrentProcess(process?: ChildProcess) {
  if (currentProcess && !currentProcess.killed) {
    currentProcess.kill('SIGKILL');
    currentProcess.on('close', (code: number) => {
      console.log(`child process exited with code ${code}`);
      if (process)setCurrentProcess(process);
    });
  } else currentProcess = process;
}

export function exportOwnerKey(
  password: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cliWalletPath = getExecutableFile(cliPath);
    if (!cliWalletPath) return reject(new Error('cli-wallet not found'));
    const args = [
      'export_owner_key',
      '--pass', password,
      '--wallet_path', walletDBPath
    ];

    const onData = (data: Buffer) => {
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

    const onClose = (code: number | null) => {
      console.log(`child process exited with code ${code}`);
    };

    runSpawnProcess({
      path: cliWalletPath, args, detached: true, onData, onClose
    });
  });
}

export function startBeamNode(
  ownerKey: string,
  password: string
): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const beamNodePath = getExecutableFile(nodePath);
    if (beamNodePath) {
      console.log('Beam node is: ', beamNodePath);
      const node = execFile(beamNodePath, [`--port=${BEAM_NODE_PORT}`,
        '--peer=eu-node01.masternet.beam.mw:8100,eu-node02.masternet.beam.mw:8100,eu-node03.masternet.beam.mw:8100,eu-node04.masternet.beam.mw:8100',
        '--owner_key', ownerKey,
        '--storage', nodeDBPath,
        '--pass', password]);

      // process.on('exit', () => {
      //   node.kill('SIGTERM');
      // });
      return resolve(node);
    }
    return reject(new Error('No node executable'));
  });
}

export function restoreExistedWallet(
  seed: string,
  password: string
): Promise<string> {
  return new Promise((resolve, reject): void => {
    const cliWalletPath = getExecutableFile(cliPath);
    if (!cliWalletPath) return reject(new Error('cli-wallet not found'));
    if (currentProcess && !currentProcess.killed) setCurrentProcess();
    if (fs.existsSync(walletDBPath)) deleteFile(walletDBPath);

    const args = [
      'restore',
      '--wallet_path', walletDBPath,
      '--pass', password,
      '--seed_phrase', seed
    ];

    const onData = (data: Buffer) => {
      const bufferString = data.toString('utf-8');
      console.log('stdout:', bufferString);
      if (bufferString.match(walletRestoreSuccess)) {
        return resolve('wallet successfully restored');
      }
      if (bufferString.match(walletRestoreError)) {
        return reject(new Error(
          'wrong seed-phrase or wallet api is running now'
        ));
      }
    };

    runSpawnProcess({
      path: cliWalletPath,
      detached: true,
      args,
      onData
    });
  });
}

export function runWalletApi(
  password: string,
  nodeProcess: ChildProcess
): Promise<string> {
  return new Promise((resolve, reject) => {
    const walletApiExe = getExecutableFile(walletApiPath);
    if (!walletApiExe) return reject(new Error('Wallet api not found'));
    const args = [
      '-n', `127.0.0.1:${BEAM_NODE_PORT}`,
      '-p', `${WALLET_API_PORT}`,
      `--pass=${password}`,
      '--use_http=1',
      `--wallet_path=${walletDBPath}`
    ];

    const onData = (data: Buffer) => {
      const bufferString = limitStr(data.toString('utf-8'), 300);
      console.log(`stdout: ${bufferString}`);
      if (bufferString.match(success)) {
        resolve('wallet api started successfully');
      }
      if (bufferString.match(error)) {
        killApiServer()
          .then(() => reject(new Error('something went wrong')));
      }
    };

    const onClose = () => {
      nodeProcess.kill('SIGKILL');
    };

    runSpawnProcess({
      path: walletApiExe,
      args,
      onData,
      onClose,
      setCurrentProcess
    });
  });
}
