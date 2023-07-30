const { validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return

    const name = req.body.name;
    const password = req.body.password;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
    
        const userDetails = {
            name: name,
            password: hashedPassword
        };
    
        const result = await User.save(userDetails);
    
        res.status(201).json({ message: 'Compte enregistré !'});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const name = req.body.name;
    const password = req.body.password;

    try {
        const user = await User.find(name);

        if (user[0].length !== 1) {
            const error = new Error('Utilisateur non trouvé.')
            error.statusCode = 401;
            throw error;
        } 

        const storedUser = user[0][0];

        const isEqual = await bcrypt.compare(password, storedUser.password);
        
        if (!isEqual) {
            const error = new Error('Mauvais mot de passe.')
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                name: storedUser.name,
                userId: storedUser.id
            },
            'secretfortoken',
            { expiresIn: '8h' }
        );
  
        res.status(200).json({ token: token, userId: storedUser.id, userName: storedUser.name });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}