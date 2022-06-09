/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable consistent-return */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-restricted-syntax */
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import { getRepository } from 'typeorm';
import { app } from 'electron';
import {
  BEAM_NODE_PORT, HTTP_MODE, WALLET_API_PORT
} from '../../common';
import { Seed } from '../../entities';
import {
  cliPath,
  getExecutableFile,
  limitStr,
  nodeDBPath,
  nodePath,
  walletApiPath,
  walletDBPath,
  ipfsPath
} from '../../utils';
import { runSpawnProcess } from '../../utils/process-handlers';

let currentProcess: ChildProcess | undefined;

let nodeUpdate = 0;

const successReg = /server/i;
const errorReg = /Please check your password/i;
const ownerKeyReg = /Owner Viewer key/i;
const walletRestoreSuccessReg = /generated:/i;
const walletRestoreErrorReg = /provide a valid seed phrase for the wallet./i;
const nodeUpdatingReq = /Updating node/i;
const notInitializedReg = /Please initialize your wallet first/i;

const peers = [
  'eu-node01.dappnet.beam.mw:8100',
  'eu-node02.dappnet.beam.mw:8100',
  'eu-node03.dappnet.beam.mw:8100'
];

export function getNodeUpdate() {
  return nodeUpdate;
}

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
        currentProcess.kill('SIGTERM');
      } else resolve('child process not active');
    }
  );
}

export function setCurrentProcess(process?: ChildProcess) {
  if (currentProcess && !currentProcess.killed) {
    currentProcess.kill('SIGTERM');
    currentProcess.on('close', (code: number) => {
      console.log(`child process exited with code ${code}`);
      if (process) setCurrentProcess(process);
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
      if (bufferString.match(errorReg)) {
        reject(new Error('Please check your password'));
      }
      if (bufferString.match(notInitializedReg)) {
        reject(
          new Error('Please initialize your wallet first...')
        );
      }
    };

    const onClose = (code: number | null) => {
      console.log(`child process exited with code ${code}`);
    };

    runSpawnProcess({
      path: cliWalletPath, args, onData, onClose
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
      const node = spawn(beamNodePath, [
        `--port=${BEAM_NODE_PORT}`,
        `--peer=${peers.join(',')}`,
        '--owner_key', ownerKey,
        '--storage', nodeDBPath,
        '--pass', password,
        '--file_log_level=verbose']);

      node.stdout.on('data', (data: Buffer) => {
        const bufferString = data.toString('utf-8');
        console.log(`Got node output: ${bufferString}`);
        if (bufferString.match(nodeUpdatingReq)) {
          const str = String(bufferString.split('node')[1]);
          nodeUpdate = Number(/\d+/.exec(str));
        }
      });

      node.stderr.on('data', (data: Buffer) => {
        const bufferString = data.toString('utf-8');
        console.log(`Got node error: ${bufferString}`);
      });

      app.on('window-all-closed', () => {
        console.log('Kill node!');
        node.kill('SIGTERM');
      });
      return resolve(node);
    }
    return reject(new Error('No node executable'));
  });
}

export function restoreExistedWallet(
  seed: string,
  password: string
): Promise<Seed> {
  return new Promise((resolve, reject): void => {
    const cliWalletPath = getExecutableFile(cliPath);
    if (!cliWalletPath) return reject(new Error('cli-wallet not found'));
    if (currentProcess && !currentProcess.killed) setCurrentProcess();
    if (fs.existsSync(walletDBPath)) deleteFile(walletDBPath);
    const seedRepository = getRepository(Seed);
    const newSeed = seedRepository.create({ seed });

    const args = [
      'restore',
      '--wallet_path', walletDBPath,
      '--pass', password,
      '--seed_phrase', seed
    ];

    const onData = (data: Buffer) => {
      const bufferString = data.toString('utf-8');
      console.log('stdout:', bufferString);
      if (bufferString.match(walletRestoreSuccessReg)) {
        seedRepository.findOne({ where: { seed } })
          .then((finded) => {
            if (!finded) {
              return seedRepository.save(newSeed)
                .then((saved) => resolve(saved));
            }
            return resolve(finded);
          });
      }
      if (bufferString.match(walletRestoreErrorReg)) {
        return reject(new Error(
          'wrong seed-phrase or wallet api is running now'
        ));
      }
    };

    runSpawnProcess({
      path: cliWalletPath,
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
      `--use_http=${HTTP_MODE}`,
      `--wallet_path=${walletDBPath}`,
      '--enable_ipfs=true',
      '--tcp_max_line=20256000',
      `--ipfs_repo=${ipfsPath}`
    ];
    const onData = (data: Buffer) => {
      const bufferString = limitStr(data.toString('utf-8'), 300);
      console.log(`stdout: ${bufferString}`);
      if (bufferString.match(successReg)) {
        resolve('wallet api started successfully');
      }
      if (bufferString.match(errorReg)) {
        killApiServer()
          .then(() => reject(new Error('Please, check your password')));
      }
    };

    const onClose = () => {
      nodeProcess.kill('SIGTERM');
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
