require('dotenv').config();

const { Usuario } = require('../database/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const register = (req, res) => {
  res.render('users/register');
}

const storeUser = async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('users/register', { errors: errors.mapped(), old: req.body });
  }

  try {
    console.log('Datos recibidos para registro:', req.body);

    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Usuario.create({
      username: name,
      email,
      password_hash: hashedPassword,
      rol: 'usuario'
    });

    res.redirect('/users/login');
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

const login = async (req, res) => {
  res.render('users/login');
}

const logout = (req, res) => {
  
      req.session.destroy();
      res.clearCookie("user");
      res.redirect('/dashboard');

};

const initSession = async (req, res) => {
  
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('Errores de validación en login:', errors.mapped());
    return res.render('users/login', { errors: errors.mapped(), old: req.body });
  }

  try {
    const { email, password } = req.body;
    const user = await Usuario.findOne({
      where: { email },
      attributes: ['id', 'username', 'email','rol']
    });
    
    req.session.usuario = {id: user.id, username: user.username, email: user.email, rol: user.rol };
    req.session.autenticado = true;

    res.redirect('/dashboard');

  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Usuario.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Usuario.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

const updateUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const user = await Usuario.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({
      username: name,
      password_hash: hashedPassword
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

const adminupdateUser = async (req, res) => {
  const errors = validationResult(req); 

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, email, password, rol } = req.body;
    const user = await Usuario.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({
      username: name,
      password_hash: hashedPassword,
      rol
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};


module.exports = { register, login, getAllUsers, getUserById, storeUser, initSession, logout, updateUser, adminupdateUser };