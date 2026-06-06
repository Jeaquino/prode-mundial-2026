const { Usuario } = require('../database/models');
const { body, validationResult } = require('express-validator');

const registerUserValide = [
    body('name')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 4 })
        .withMessage('El nombre debe tener al menos 4 caracteres'),
    body('email')
        .notEmpty()
        .withMessage('El email es obligatorio')
        .isEmail()
        .withMessage('El email debe ser válido')
        .custom(async (email) => {
            const existingUser = await Usuario.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('El email ya está registrado');
            }
            console.log('Email válido y no registrado:', email);
            return true;
        }),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('confirmPassword')
        .notEmpty()
        .withMessage('La confirmación de contraseña es obligatoria')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Las contraseñas deben coincidir')
];

module.exports = registerUserValide;
