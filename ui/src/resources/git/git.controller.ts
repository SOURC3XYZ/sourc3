// import express from 'express';
// import {
//   deleteRepoService,
//   getAllSeedsService,
//   getBlobDataService,
//   getBranchesService,
//   getCommitsService,
//   getCurrentService,
//   getTreeService,
//   mountService
// } from './git.service';

// const router = express.Router();

// router.route('/repos/:seedId').get(async (req, res) => {
//   const { seedId } = req.params;
//   const data = await getAllSeedsService(seedId);
//   return res.status(201).send(data);
// });

// router.route('/current').get(async (_, res) => {
//   const data = await getCurrentService();
//   if (data.isOk) return res.status(201).send(data.current);
//   return res.status(404).send(data.message);
// });

// router.route('/branches').get(async (_, res) => {
//   const data = await getBranchesService();
//   if (data.isOk) return res.status(201).send(data);
//   return res.status(404).send(data.message);
// });

// router.route('/:seedId').post(
//   async (req, res) => {
//     const { remote, local } = req.body;
//     const { seedId } = req.params;
//     if (remote) {
//       const data = await mountService(remote, local, seedId);
//       if (data.isOk) return res.status(201).send(data);
//       return res.status(404).send(data.message);
//     }
//     return res.status(404).send('the required parameters are not transferred');
//   }
// );

// router.route('/commits/:oid').get(async (req, res) => {
//   const { oid } = req.params;
//   const data = await getCommitsService(oid);
//   if (data.isOk) return res.status(201).send(data);
//   return res.status(404).send(data.message);
// });

// router.route('/tree/:treeOid').get(async (req, res) => {
//   const { treeOid } = req.params;
//   const data = await getTreeService(treeOid);
//   if (data.isOk) return res.status(201).send(data);
//   return res.status(404).send(data.message);
// });

// router.route('/blob/:oid').get(async (req, res) => {
//   const { oid } = req.params;
//   const data = await getBlobDataService(oid);
//   if (data.isOk) return res.status(201).send(data);
//   return res.status(404).send(data.message);
// });

// router.route('/:repoId').delete(async (req, res) => {
//   const { repoId } = req.params;
//   const data = await deleteRepoService(repoId);
//   if (data.isOk) return res.status(201).send(data);
//   return res.status(404).send(data.message);
// });

// export default router;
