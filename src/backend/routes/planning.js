const express = require('express');

const { body } = require('express-validator');

const planningController = require('../controllers/planning');

const auth = require('../middleware/auth');

const router = express.Router();

/*router.get('/:userID', [auth], planningController.fetchAll);

router.get('/:userID/:equipeID', [auth], planningController.fetch);*/

router.get('/:date/:userID/:equipeID/:collaborateursID', [auth], planningController.find);

router.post(
    '/',
    [
        auth,
        body('date').trim().not().isEmpty(),
        body('user').trim().not().isEmpty(),
        body('equipeId').trim().not().isEmpty(),
        body('locked').trim(),
        body('collaborateursId').trim(),
        body('creneau').trim(),
    ], planningController.planningPost
);

router.put(
    '/',
    [
        auth,
        body('id').trim().not().isEmpty(),
        body('locked').trim(),
        body('creneau').trim(),
    ], planningController.updatePlanning
);

router.delete('/:equipeId', auth, planningController.deletePlanning);

module.exports = router;