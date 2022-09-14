/* eslint-disable import/no-extraneous-dependencies */
import { spawn, ChildProcess } from 'child_process';

import { app } from 'electron';
import {loggerLevel} from "../middlewares";
import {configPath} from "../common";

type BufferHandler = (data: Buffer) => undefined | void;

type OnCloseHandler = (code: number | null, signal?: any) => undefined | void;

type SpawnProcessParams = {
  path: string;
  args: string[];
  detached?: boolean;
  onData?: BufferHandler;
  onError?: BufferHandler;
  onClose?: OnCloseHandler;
  setCurrentProcess?: (childProcess?: ChildProcess) => void;
};

export const runSpawnProcess = (
  params: SpawnProcessParams
) => {
  const {
    path, args, detached, onData, onError, onClose, setCurrentProcess
  } = params;
  const childProcess = spawn(path, args, { detached: detached, cwd: configPath });

  if (onData) childProcess.stdout.on('data', onData);

  if (onError) childProcess.stderr.on('error', onError);

  if (onClose) childProcess.on('close', onClose);

  if (setCurrentProcess) setCurrentProcess(childProcess);

  process.on('SIGINT', () => {
    childProcess.kill('SIGINT');
  });
  process.on('close', () => {
    childProcess.kill('SIGINT');
  });
  process.on('exit', () => {
    childProcess.kill('SIGINT');
  });

  childProcess.stdout.on('data', (data: Buffer) => {
    const bufferString = data.toString('utf-8');
    loggerLevel("info", 'stdout: ' + bufferString);
    console.log('stdout: ' + bufferString);
  });

  childProcess.stderr.on('data', (data: Buffer) => {
    const bufferString = data.toString('utf-8');
    loggerLevel("info", 'stderr: ' + bufferString);
    console.log('stderr: ' + bufferString);
  });

  app.on('window-all-closed', () => {
    loggerLevel("info", `Kill ${path}!`);
    childProcess.kill('SIGTERM');
  });

  return childProcess;
};
