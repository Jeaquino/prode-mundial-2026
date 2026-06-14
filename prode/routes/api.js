const express = require('express');
const router = express.Router();
const { getAllMatchs, getMatcsPaginate } = require('../controllers/partidos');
const { savePronostico } = require('../controllers/pronosticos');
const { syncWorldCup, adminUpsertResult, getSyncStatus } = require('../controllers/sync');

router.get('/matchs', getAllMatchs);
router.get('/matchs/paginate', getMatcsPaginate);
router.post('/pronosticos', savePronostico);
router.get('/sync/worldcup/status', getSyncStatus);
router.post('/sync/worldcup', syncWorldCup);
router.post('/admin/results', adminUpsertResult);

module.exports = router;
