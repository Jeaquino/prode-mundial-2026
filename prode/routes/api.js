const express = require('express');
const router = express.Router();
const {getAllMatchs,getMatcsPaginate} = require('../controllers/partidos');

/* GET home page. */
router.get('/matchs', getAllMatchs);
router.get('/matchs/paginate', getMatcsPaginate);

module.exports = router;
