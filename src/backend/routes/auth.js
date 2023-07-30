const express = require('express');

const { body } = require('express-validator');

const router = express.Router();

const User = require('../models/user');

const authController = require('../controllers/auth');

router.post(
    '/signup',
    [
        body('name').trim().not().isEmpty().withMessage('Veuillez entrer un nom.')
            .custom(async (name) => {
                const user = await User.find(name);
                if (user[0].length > 0) {
                    return Promise.reject('Ce nom existe déjà.')
                }
            }),
        body('password').trim().isLength({ min: 4 })
    ], authController.signup
);

router.post('/login', authController.login);

module.exports = router;