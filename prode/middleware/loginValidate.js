const { Usuario } = require('../database/models');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
let user;
const loginUserValide = [
    body('email')
        .notEmpty()
        .withMessage('El email es obligatorio')
        .isEmail()
        .withMessage('El email debe ser válido')
        .custom(async (email) => {
            user = await Usuario.findOne({ where: { email } });
            if (!user) {
                throw new Error('Credenciales invalidas');
            }
            console.log('Email válido', email);
            return true;
        }),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres')
        .custom(async (password, { req }) => {
            const email = req.body.email;
            if (user) {
                const isMatch = await bcrypt.compare(password, user.password_hash);
                if (!isMatch) {
                    throw new Error('Credenciales invalidas');
                }
            }
            return true;
        })
];

module.exports = loginUserValide;
