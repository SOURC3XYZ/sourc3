import express, { Request, Response } from 'express';
import { ErrorHandler } from '../../middlewares';
import {
  restoreWallet, enterUser, removeExistedWallet, killApi
} from './wallet.service';

const router = express.Router();

router.route('/start').post(
  async (req: Request, res: Response, next): Promise<Response | void> => {
    const { password } = req.body;
    if (password) {
      const data = await enterUser(password);
      if (data.isOk) return res.status(201).json(data.message);
      return next(new ErrorHandler(404, data.message));
    } return next(new ErrorHandler(404, 'you did not send the password'));
  }
);

router.route('/restore').post(
  async (req: Request, res: Response, next): Promise<Response | void> => {
    const { seed, password } = req.body;
    if (seed && password) {
      const data = await restoreWallet(seed, password);
      if (data.isOk) return res.status(201).json(data.message);
      return next(
        new ErrorHandler(
          404,
          data.message
        )
      );
    } return next(
      new ErrorHandler(404, 'you did not send the password or/and seed-phrase')
    );
  }
);

router.route('/').delete(
  async (_req: Request, res: Response, next): Promise<Response | void> => {
    const removed = await removeExistedWallet();
    if (removed) return res.status(201).json('wallet removed');
    return next(new ErrorHandler(500, 'wallet may be in use now'));
  }
);

router.route('/kill').delete(
  async (_req: Request, res: Response): Promise<Response | void> => {
    const killMessage = await killApi();
    res.status(201).json(killMessage);
  }
);

export default router;
