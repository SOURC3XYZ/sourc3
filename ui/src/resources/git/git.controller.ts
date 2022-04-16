import express from 'express';
import { ErrorHandler } from '../../middlewares';
import {
  deleteRepoService,
  getAllSeedsService,
  getBlobDataService,
  getBranchesService,
  getCommitsService,
  getCurrentService,
  getTreeService,
  mountService
} from './git.service';

const router = express.Router();

router.route('/repos/:seedId').get(async (req, res) => {
  const { seedId } = req.params;
  const data = await getAllSeedsService(seedId);
  return res.status(201).json(data);
});

router.route('/current').get(async (_, res, next) => {
  const data = await getCurrentService();
  if (data.isOk) return res.status(201).json(data.current);
  return next(new ErrorHandler(500, data.message));
});

router.route('/branches').get(async (_, res, next) => {
  const data = await getBranchesService();
  if (data.isOk) return res.status(201).json(data);
  return next(new ErrorHandler(404, data.message));
});

router.route('/:seedId').post(
  async (req, res, next) => {
    const { remote, local } = req.body;
    const { seedId } = req.params;
    if (remote) {
      const data = await mountService(remote, local, seedId);
      if (data.isOk) return res.status(201).json(data);
      return next(new ErrorHandler(404, data.message));
    } return next(new ErrorHandler(
      404,
      'the required parameters are not transferred'
    ));
  }
);

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

router.route('/:repoId').delete(async (req, res, next) => {
  const { repoId } = req.params;
  const data = await deleteRepoService(repoId);
  if (data.isOk) return res.status(201).json(data);
  return next(new ErrorHandler(404, data.message));
});

export default router;
