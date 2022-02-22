import { spawn, ChildProcess } from 'child_process';

type BufferHandler = (data: Buffer) => undefined | void;

type OnCloseHandler = (code:number | null, signal?: any) => undefined | void;

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
  const childProcess = spawn(path, args, { detached });

  if (onData) childProcess.stdout.on('data', onData);

  if (onError) childProcess.stderr.on('error', onError);

  if (onClose) childProcess.on('close', onClose);

  if (setCurrentProcess) setCurrentProcess(childProcess);
};
