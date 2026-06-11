const express = require('express');
const router = express.Router();
const { register, storeUser, login, getAllUsers, getUserById, initSession, logout, updateUser ,adminupdateUser } = require('../controllers/usuarios');
const registerUserValide = require('../middleware/registerUserValide');
const loginVerify = require('../middleware/loginValidate');
const isAdmin = require('../middleware/isAdmin');

router
  .get('/register', register)
  .post('/register', registerUserValide, storeUser)
  .put('/users/:id', loginVerify, updateUser)
  .get('/login', login)
  .post('/login', loginVerify, initSession)
  .get('/users', loginVerify, getAllUsers)
  .get('/users/:id', loginVerify, getUserById)
  .get('/logout', logout)
  .put('/admin/users/:id', isAdmin, adminupdateUser)

module.exports = router;
