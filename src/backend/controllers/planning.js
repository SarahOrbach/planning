const { validationResult } = require('express-validator');

const Planning = require('../models/planning');

/*exports.fetchAll = async (req, res, next) => {
    try {
       const [allPlanning] = await Planning.fetchAll( req.params.userID );
       res.status(200).json(allPlanning);
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
       const [allPlanning] = await Planning.fetch( req.params.userID, req.params.equipeID );
       res.status(200).json(allPlanning);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}*/

exports.find = async (req, res, next) => {
    console.log('controllers', req.params);
    try {
       // console.log('try');
       const [allPlanning] = await Planning.find(req.params.date, req.params.userID, req.params.equipeID , req.params.collaborateurID);
       //console.log('endTry');
       res.status(200).json(allPlanning);
    } catch (err) {
        //console.log('err',err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.planningPost = async (req, res, next) => {
    //console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) return

    const date = req.body.date;
    const user = req.body.user;
    const equipeId = req.body.equipeId;
    const locked = req.body.locked;
    const collaborateurId = req.body.collaborateurId;
    const creneau = req.body.creneau;

    try {
        const planningDetails = {
            date: date,
            user: user,
            equipeId: equipeId,
            locked: locked,
            collaborateurId: collaborateurId,
            creneau: creneau,
        };
    
        const result = await Planning.save(planningDetails);
    
        res.status(201).json({ message: 'Jour enregistré !'});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updatePlanning = async (req, res, next) => {
    console.log('update', req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) return

    const id = req.body.id;
    const locked = req.body.locked;
    const creneau = req.body.creneau;

    try {
        const planningDetails = {
            id: id,
            locked: locked,
            creneau: creneau,
        };
    
        const result = await Planning.update(planningDetails);
    
        res.status(201).json({ message: 'Jour enregistré !'});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deletePlanning = async (req, res, next) => {
    try {
       const deleteResponse = await Planning.delete(req.params.equipeId);
       res.status(200).json(deleteResponse);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}