import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import {
  ErrorHandler,
  handleError,
  logerRequests,
  uncaughtException,
  unhandledRejection
} from './middlewares';
import { beamRouter } from './resources/beam-api';
import { gitRouter } from './resources/git';
import { walletRouter } from './resources/wallet';

const expressApp = express();

expressApp.use(cors());
expressApp.use(express.json());

expressApp.use(logerRequests);
console.log("Setup logger");
expressApp.use('/', (req, res, next) => {
  if (req.originalUrl === '/') {
    res.send('Service is running!');
    return;
  }
  next();
});
console.log("Setup root");

expressApp.use('/wallet', walletRouter);

console.log("Setup walley");
expressApp.use('/beam', beamRouter);

console.log("Setup beam");
expressApp.use('/git', gitRouter);

console.log("Setup git");
expressApp.use((err:ErrorHandler, _req:Request, res:Response, next:NextFunction) => {
  handleError(err, res);
  next();
});

process.on('uncaughtException', uncaughtException);
process.on('unhandledRejection', unhandledRejection);

export { expressApp };
