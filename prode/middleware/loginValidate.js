const { body } = require('express-validator');

module.exports = [
  body('email').trim().notEmpty().withMessage('El usuario es obligatorio'),
  body('email').trim().matches(/^[a-zA-Z0-9._ -]+$/).withMessage('Solo usa letras, numeros, punto, guion o guion bajo'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];
