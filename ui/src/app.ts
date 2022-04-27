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

const app = express();

app.use(cors());
app.use(express.json());

app.use(logerRequests);

app.use('/', (req, res, next) => {
  if (req.originalUrl === '/') {
    res.send('Service is running!');
    return;
  }
  next();
});

app.use('/wallet', walletRouter);

app.use('/beam', beamRouter);

app.use('/git', gitRouter);

app.use((err:ErrorHandler, _req:Request, res:Response, next:NextFunction) => {
  handleError(err, res);
  next();
});

process.on('uncaughtException', uncaughtException);
process.on('unhandledRejection', unhandledRejection);

export default app;
