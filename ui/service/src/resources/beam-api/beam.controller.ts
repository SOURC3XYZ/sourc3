import express, { Request, Response } from 'express';
import { ErrorHandler } from '../../middlewares';
import { callApi } from './beam.service';

const router = express.Router();

router.route('/').post(
  async (req: Request, res: Response, next): Promise<Response | void> => {
    const data = await callApi(req.body);
    if (data.isOk) return res.status(201).json(data.res);
    return next(new ErrorHandler(404, data.error as string));
  }
);

export default router;
