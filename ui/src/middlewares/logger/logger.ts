import { createLogger, format, transports } from 'winston';
import { Request, Response, NextFunction } from 'express';
import { finished } from 'stream';
import { limitStr } from '../../utils';
import path from 'path';
import { app } from 'electron';

const logger = createLogger({
  level: 'silly',
  format: format.combine(format.colorize(), format.timestamp(), format.cli()),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(app.getPath("logs"), 'error.log'),
      level: 'error',
      format: format.combine(format.uncolorize(), format.json())
    }),
    new transports.File({
      filename: path.join(app.getPath("logs"), 'info.log'),
      level: 'info',
      format: format.combine(format.uncolorize(), format.json())
    })
  ],
  exitOnError: false
});

export const logerRequests = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { method, url } = req;
  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);
  const start = Date.now();
  logger.info(
    // eslint-disable-next-line max-len
    `\n METHOD: ${method}\n URL: ${url}\n QUERY: ${query} \n BODY: ${limitStr(body, 300)}`
  );
  next();

  finished(req, () => {
    const ms = Date.now() - start;
    const { statusCode } = res;
    logger.info(
      // eslint-disable-next-line max-len
      `\n METHOD: ${method}\n URL: ${url} \n STATUS: ${statusCode} \n QUERY: ${query} \n BODY: ${limitStr(body, 300)} \n TIME: ${ms}`
    );
  });
};

export const loggerErrors = (statusCode: number, message: string):void => {
  logger.warn(`\n CODE: ${statusCode}\n MESSAGE: ${message}`);
};

export const uncaughtExceptionLogger = (error:Error, origin:string):void => {
  logger.error(`${error} origin ${origin}`);
};

export const unhandledRejectionLogger = (message: string):void => {
  logger.error(`Unhandled rejection detected: ${message}`);
};

export const loggerLevel = (level: string, message: any): void => {
  logger.log(level, message);
}
