import express from 'express';
import { ErrorHandler } from '../../middlewares';
import {
  getBlobDataService,
  getBranchesService, getCommitsService, getTreeService, mountService
} from './git.service';

const router = express.Router();

router.route('/init').post(
  async (req, res, next) => {
    const { remote, local } = req.body;
    if (remote) {
      const data = await mountService(remote, local);
      if (data.isOk) return res.status(201).json(data);
      return next(new ErrorHandler(404, data.message));
    } return next(new ErrorHandler(
      404,
      'the required parameters are not transferred'
    ));
  }
);

router.route('/branches').get(async (_, res, next) => {
  const data = await getBranchesService();
  if (data.isOk) return res.status(201).json(data);
  return next(new ErrorHandler(404, data.message));
});

router.route('/commits/:oid').get(async (req, res, next) => {
  const { oid } = req.params;
  const data = await getCommitsService(oid);
  if (data.isOk) return res.status(201).json(data);
  return next(new ErrorHandler(404, data.message));
});

router.route('/tree/:treeOid').get(async (req, res, next) => {
  const { treeOid } = req.params;
  const data = await getTreeService(treeOid);
  if (data.isOk) return res.status(201).json(data);
  return next(new ErrorHandler(404, data.message));
});

router.route('/blob/:oid').get(async (req, res, next) => {
  const { oid } = req.params;
  const data = await getBlobDataService(oid);
  if (data.isOk) return res.status(201).json(data);
  return next(new ErrorHandler(404, data.message));
});

export default router;
