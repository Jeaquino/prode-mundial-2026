const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/prode');

router.get('/', getDashboard);
router.get('/dashboard', getDashboard);

module.exports = router;
