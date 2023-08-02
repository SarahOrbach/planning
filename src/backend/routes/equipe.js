const express = require('express');

const { body } = require('express-validator');

const equipeController = require('../controllers/equipe');

const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:userID', [auth], equipeController.fetchAll);

router.get('/:userID/:equipeID', [auth], equipeController.fetch);

router.post(
    '/',
    [
        auth,
        body('name').trim().not().isEmpty(),
        body('user').trim().not().isEmpty(),
        body('creneauHours').trim(),
        body('creneauText').trim(),
        body('collaborateursId').trim(),
        body('list2').trim(),
        body('list3').trim(),
        body('contraintesC').trim(),
        body('contraintesH').trim(),
    ], equipeController.equipePost
);

router.put(
    '/general',
    [
        auth,
        body('id').trim().not().isEmpty(),
        body('name').trim().not().isEmpty(),
        body('user').trim().not().isEmpty(),
        body('creneauHours').trim(),
        body('creneauText').trim(),
        body('collaborateursId').trim(),
        body('list2').trim(),
        body('list3').trim(),
        body('contraintesC').trim(),
        body('contraintesH').trim(),
    ], equipeController.updateEquipe
);

router.put(
    '/collab',
    [
        auth,
        body('id').trim().not().isEmpty(),
        body('collaborateursId').trim(),
    ], equipeController.updateCollab
);

router.delete('/:id', auth, equipeController.deleteEquipe);

module.exports = router;