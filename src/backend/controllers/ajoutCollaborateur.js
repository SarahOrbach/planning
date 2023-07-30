const { validationResult } = require('express-validator');

const Collaborateur = require('../models/collaborateur');

exports.fetchAll = async (req, res, next) => {
    try {
       const [allCollaborateurs] = await Collaborateur.fetchAll( req.params.userID );
       res.status(200).json(allCollaborateurs);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.fetch = async (req, res, next) => {
    console.log(req.params)
    try {
       const [allCollaborateur] = await Collaborateur.fetch( req.params.userID, req.params.collaborateurID );
       res.status(200).json(allCollaborateur);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.ajoutCollaborateurPost = async (req, res, next) => {
    //console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) return

    const name = req.body.name;
    const user = req.body.user;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const idEnt = req.body.idEnt;
    const mail = req.body.mail;
    const phone = req.body.phone;
    const teams = req.body.teams;
    const hours = req.body.hours;
    const days = req.body.days;

    try {
        const collaborateurDetails = {
            name: name,
            user: user,
            firstName: firstName,
            lastName: lastName,
            idEnt: idEnt,
            mail: mail,
            phone: phone,
            teams: teams,
            hours: hours,
            days: days,
        };
    
        const result = await Collaborateur.save(collaborateurDetails);
    
        res.status(201).json({ message: result});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateCollaborateur = async (req, res, next) => {
    //console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) return

    const id = req.body.id;
    const name = req.body.name;
    const user = req.body.user;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const idEnt = req.body.idEnt;
    const mail = req.body.mail;
    const phone = req.body.phone;
    const teams = req.body.teams;
    const hours = req.body.hours;
    const days = req.body.days;

    try {
        const collaborateurDetails = {
            id: id,
            name: name,
            user: user,
            firstName: firstName,
            lastName: lastName,
            idEnt: idEnt,
            mail: mail,
            phone: phone,
            teams: teams,
            hours: hours,
            days: days,
        };
    
        const result = await Collaborateur.update(collaborateurDetails);
    
        res.status(201).json({ message: 'Collaborateur enregistré !'});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateEq = async (req, res, next) => {
    console.log('update eq controler', req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) return

    const id = req.body.id;
    const teams = req.body.teams;

    try {
        const collaborateurDetails = {
            id: id,
            teams: teams,
        };
    
        const result = await Collaborateur.updateEq(collaborateurDetails);
    
        res.status(201).json({ message: 'Collaborateur enregistré !'});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteCollaborateur = async (req, res, next) => {
    try {
       const deleteResponse = await Collaborateur.delete(req.params.id);
       res.status(200).json(deleteResponse);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}