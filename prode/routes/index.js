const express = require('express');
const router = express.Router();
const {getDashboard} = require('../controllers/dashboard');

/* GET home page. */
router.get('/dashboard', getDashboard);

module.exports = router;
