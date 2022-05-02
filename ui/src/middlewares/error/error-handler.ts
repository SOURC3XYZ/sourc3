import { Response } from 'express';
import fs from 'fs';
import {
  loggerErrors,
  uncaughtExceptionLogger,
  unhandledRejectionLogger
} from '../logger/logger';

const CODE = 500;

export class ErrorHandler extends Error {
  code: number;

  constructor(statusCode: number, message?: string) {
    super();
    this.code = statusCode || CODE;
    if (message) {
      this.message = message;
    }
  }
}

export const handleError = (err: ErrorHandler, res: Response): void => {
  const { code, message } = err;
  loggerErrors(code, message);
  res.status(code).json({
    status: 'error',
    code,
    message
  });
};

export const uncaughtException = (err: Error, origin: string):void => {
  fs.writeFileSync(
    './crash-data.log',
    `Caught exception: ${err}\nException origin: ${origin}`
  );
  uncaughtExceptionLogger(err, origin);
  process.exit(1);
};

export const unhandledRejection = (reason:{ message:string }):void => {
  fs.writeFileSync(
    './crash-data.log',
    `Caught exception: ${reason.message})`
  );
  unhandledRejectionLogger(reason.message);
  process.exit(1);
};
