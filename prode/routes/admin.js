
const express = require('express');
const router = express.Router();
const { adminUpdateUser,adminUpdateMatch,adminGetPanel } = require('../controllers/admin');
const isAdmin = require('../middleware/isAdmin');

router
  .get('/panel', isAdmin, adminGetPanel)
  .put('/users/:id', isAdmin, adminUpdateUser)
  .put('/partidos/:id', isAdmin, adminUpdateMatch)

module.exports = router;