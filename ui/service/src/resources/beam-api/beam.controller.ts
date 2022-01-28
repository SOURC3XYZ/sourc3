import express, { Request, Response } from 'express';
import { ErrorHandler } from '../../middlewares';
import { resToBeamApi } from './beam.service';

const router = express.Router();

router.route('/').post(
  async (req: Request, res: Response, next): Promise<Response | void> => {
    const data = await resToBeamApi(req.body)
      .catch((err) => console.log('err', err));
    if (data) return res.status(201).json(data);
    return next(new ErrorHandler(404));
  }
);

export default router;
