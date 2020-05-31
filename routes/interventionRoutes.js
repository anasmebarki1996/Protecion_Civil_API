const express = require('express');
const interventionController = require('../controllers/interventionController');
const authController = require('../controllers/authController');
const appelController = require('../controllers/appelController');
const router = express.Router();


router
    .post('/intervention/getAllIntervention', authController.protect, authController.restricTo('cco_agent', 'admin'), authController.checkUnite, interventionController.getAllIntervention)
    .post('/intervention/getAllIntervention_Envoye', authController.protect, authController.restricTo('cco_agent', 'admin'), interventionController.getAllIntervention_Envoye)
    // .post('/intervention/getAllIntervention_Recue', authController.protect, authController.checkUnite, interventionController.getAllIntervention_Recue)
    .post('/intervention/getAllIntervention_EnCours', authController.protect, authController.checkUnite, interventionController.getAllIntervention_EnCours)
    .post('/addDateTimeDepart', authController.protect, authController.restricTo('chef'), appelController.addDateTimeDepart)
    .post('/intervention/getIntervention', authController.protect, authController.checkUnite, interventionController.getIntervention)
    .get('/intervention/getAllIntervention_name', authController.protect, authController.checkUnite, interventionController.getAllIntervention_name)
    .post('/intervention/envoyerIntervention', authController.protect, interventionController.envoyerIntervention)
    .post('/intervention/envoyerInterventionAuChef', authController.protect, interventionController.envoyerInterventionAuChef)
    .post('/intervention/getIntervention_details', authController.protect, authController.restricTo('cco_agent', 'admin'), interventionController.getIntervention_details)



module.exports = router;