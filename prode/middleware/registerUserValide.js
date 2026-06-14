const { body } = require('express-validator');

module.exports = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().notEmpty().withMessage('El usuario es obligatorio'),
  body('email').trim().matches(/^[a-zA-Z0-9._ -]+$/).withMessage('Solo usa letras, numeros, punto, guion o guion bajo'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];
