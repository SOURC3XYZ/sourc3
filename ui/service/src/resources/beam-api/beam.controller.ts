import express, { Request, Response } from 'express';
import { ErrorHandler } from '../../middlewares';
import { callApi, getSyncEvents, unsubSyncEvents } from './beam.service';

const router = express.Router();

router.route('/').post(
  async (req: Request, res: Response, next): Promise<Response | void> => {
    const data = await callApi(req.body);
    if (data.isOk) return res.status(201).json(data.res);
    return next(new ErrorHandler(404, data.error as string));
  }
);

router.route('/sync').get(
  async (_: Request, res: Response): Promise<Response | void> => {
    const ev = getSyncEvents();
    return res.status(201).json(ev);
  }
);

router.route('/').delete(
  async (_: Request, res: Response): Promise<Response | void> => res.status(201)
    .json(unsubSyncEvents())
);

export default router;
