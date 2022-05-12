import express, { Request, Response } from 'express';
import { callApi } from './beam.service';

const router = express.Router();

router.route('/').post(
  async (req: Request, res: Response): Promise<Response | void> => {
    const data = await callApi(req.body);
    if (data.isOk) return res.status(201).send(data.res);
    return res.status(404).send(data.error);
  }
);

export default router;
