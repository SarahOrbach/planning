const { validationResult } = require('express-validator');

const Equipe = require('../models/equipe');

exports.fetchAll = async (req, res, next) => {
    try {
       const [allEquipe] = await Equipe.fetchAll( req.params.userID );
       res.status(200).json(allEquipe);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.fetch = async (req, res, next) => {
    //console.log('param', req.params, req.params.equipeId);
    try {
       const [allEquipe] = await Equipe.fetch( req.params.userID, req.params.equipeID );
       res.status(200).json(allEquipe);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.equipePost = async (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) return

    const name = req.body.name;
    const user = req.body.user;
    const creneauHours = req.body.creneauHours;
    const creneauText = req.body.creneauText;
    const collaborateursId = req.body.collaborateursId;
    const list2 = req.body.list2;
    const list3 = req.body.list3;
    const contraintesC = req.body.contraintesC;
    const contraintesH = req.body.contraintesH;
    const resume = req.body.resume;

    try {
        const equipeDetails = {
            name: name,
            user: user,
            creneauHours: creneauHours,
            creneauText: creneauText,
            collaborateursId: collaborateursId,
            list2: list2,
            list3: list3,
            contraintesC: contraintesC,
            contraintesH: contraintesH,
            resume: resume,
        };
    
        const result = await Equipe.save(equipeDetails);
    
        res.status(201).json({ message: result});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateEquipe = async (req, res, next) => {
    console.log('update equipe', req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) return

    const name = req.body.name;
    const user = req.body.user;
    const creneauHours = req.body.creneauHours;
    const creneauText = req.body.creneauText;
    const collaborateursId = req.body.collaborateursId;
    const list2 = req.body.list2;
    const list3 = req.body.list3;
    const contraintesC = req.body.contraintesC;
    const contraintesH = req.body.contraintesH;
    const resume = req.body.resume;
    const id = req.body.id;

    try {
        const equipeDetails = {
            name: name,
            user: user,
            creneauHours: creneauHours,
            creneauText: creneauText,
            collaborateursId: collaborateursId,
            list2: list2,
            list3: list3,
            contraintesC: contraintesC,
            contraintesH: contraintesH,
            resume: resume,
            id: id,
        };
    
        const result = await Equipe.update(equipeDetails);
    
        res.status(201).json({ message: 'Equipe enregistré !'});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateCollab = async (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) return

    const collaborateursId = req.body.collaborateursId;
    const id = req.body.id;

    try {
        const equipeDetails = {
            collaborateursId: collaborateursId,
            id: id,
        };
    
        const result = await Equipe.updateCollab(equipeDetails);
    
        res.status(201).json({ message: 'Equipe enregistré !'});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteEquipe = async (req, res, next) => {
    try {
       const deleteResponse = await Equipe.delete(req.params.id);
       res.status(200).json(deleteResponse);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}