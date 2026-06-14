const express = require('express');
const router = express.Router();
const { register, storeUser, login, initSession, logout } = require('../controllers/usuarios');
const registerUserValide = require('../middleware/registerUserValide');
const loginVerify = require('../middleware/loginValidate');

router
  .get('/register', register)
  .post('/register', registerUserValide, storeUser)
  .get('/login', login)
  .post('/login', loginVerify, initSession)
  .get('/logout', logout);

module.exports = router;
