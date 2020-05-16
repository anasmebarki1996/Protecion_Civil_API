const express = require('express');
const interventionController = require('../controllers/interventionController');
const authController = require('../controllers/authController');
const appelController = require('../controllers/appelController');
const router = express.Router();


router
    .post('/getAllIntervention', authController.protect, authController.checkUnite, interventionController.getAllInterventions)
    // .post('/getIntervention', interventionController.getIntervention)
    .post('/addDateTimeDepart', authController.protect, authController.restricTo('chef'), appelController.addDateTimeDepart)
    .post('/intervention/envoyerIntervention', authController.protect, interventionController.envoyerIntervention)
    .post('/intervention/getIntervention', authController.protect, authController.checkUnite, interventionController.getIntervention)


module.exports = router;