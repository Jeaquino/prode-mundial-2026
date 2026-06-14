require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Usuario } = require('../database/models');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const logPath = path.join(__dirname, '..', 'logs', 'auth.log');
function logAuth(message) {
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, `${new Date().toISOString()} ${message}\n`);
}

const register = (req, res) => res.render('users/register', { title: 'Registro', emailSuffix: '@prode.com' });

const storeUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('users/register', { errors: errors.mapped(), old: req.body, title: 'Registro', emailSuffix: '@prode.com' });
  }
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.trim();
    const fullEmail = `${username}@prode.com`;
    const created = await Usuario.create({
      username,
      email: fullEmail,
      password_hash: hashedPassword,
      rol: 'usuario',
    });
    req.session.usuario = { id: created.id, username: created.username, email: created.email, rol: created.rol };
    req.session.autenticado = true;
    logAuth(`REGISTER_OK username=${username} email=${fullEmail}`);
    return res.redirect('/');
  } catch (error) {
    logAuth(`REGISTER_FAIL username=${req.body?.email || ''} error=${error.message}`);
    return res.render('users/register', { errors: { email: { msg: error.name === 'SequelizeUniqueConstraintError' ? 'El usuario ya existe' : 'No se pudo crear el usuario' } }, old: req.body, title: 'Registro', emailSuffix: '@prode.com' });
  }
};

const login = (req, res) => res.render('users/login', { title: 'Login', emailSuffix: '@prode.com' });

const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/users/login');
  });
};

const initSession = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('users/login', { errors: errors.mapped(), old: req.body, title: 'Login', emailSuffix: '@prode.com' });
  }

  try {
    const { email, password } = req.body;
    const fullEmail = `${email.trim()}@prode.com`;
    const user = await Usuario.findOne({ where: { email: fullEmail } });
    if (!user) {
      logAuth(`LOGIN_FAIL user=${fullEmail} reason=not_found`);
      return res.status(401).render('users/login', { errors: { email: { msg: 'Credenciales invalidas' } }, old: req.body, title: 'Login', emailSuffix: '@prode.com' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      logAuth(`LOGIN_FAIL user=${fullEmail} reason=bad_password`);
      return res.status(401).render('users/login', { errors: { password: { msg: 'Credenciales invalidas' } }, old: req.body, title: 'Login', emailSuffix: '@prode.com' });
    }

    req.session.usuario = { id: user.id, username: user.username, email: user.email, rol: user.rol };
    req.session.autenticado = true;
    logAuth(`LOGIN_OK user=${fullEmail}`);
    return res.redirect('/');
  } catch (error) {
    logAuth(`LOGIN_FAIL user=${req.body?.email || ''} reason=exception ${error.message}`);
    return res.render('users/login', { errors: { email: { msg: 'No se pudo iniciar sesion' } }, old: req.body, title: 'Login', emailSuffix: '@prode.com' });
  }
};

module.exports = { register, login, storeUser, initSession, logout };
