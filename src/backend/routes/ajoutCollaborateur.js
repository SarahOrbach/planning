const express = require('express');

const { body } = require('express-validator');

const ajoutCollaborateurController = require('../controllers/ajoutCollaborateur');

const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:userID', [auth], ajoutCollaborateurController.fetchAll);

router.get('/:userID/:collaborateursID', [auth], ajoutCollaborateurController.fetch);

router.post(
    '/',
    [
        auth,
        body('name').trim().not().isEmpty(),
        body('user').trim().not().isEmpty(),
        body('firstName').trim(),
        body('lastName').trim(),
        body('idEnt').trim(),
        body('mail').trim(),
        body('phone').trim(),
        body('teams').trim(),
        body('hours').trim(),
        body('days').trim(),
    ], ajoutCollaborateurController.ajoutCollaborateurPost
);

router.put(
    '/general',
    [
        auth,
        body('id').trim().not().isEmpty(),
        body('name').trim().not().isEmpty(),
        body('user').trim().not().isEmpty(),
        body('firstName').trim(),
        body('lastName').trim(),
        body('idEnt').trim(),
        body('mail').trim(),
        body('phone').trim(),
        body('teams').trim(),
        body('hours').trim(),
        body('days').trim(),
    ], ajoutCollaborateurController.updateCollaborateur
);

router.put(
    '/eq',
    [
        auth,
        body('id').trim().not().isEmpty(),
        body('teams').trim(),
    ], ajoutCollaborateurController.updateEq
);

router.delete('/:id', auth, ajoutCollaborateurController.deleteCollaborateur);

module.exports = router;