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
    .post('/intervention/getIntervention', authController.protect, authController.checkUnite, interventionController.getIntervention)
    .get('/intervention/getAllIntervention_name', authController.protect, authController.checkUnite, interventionController.getAllIntervention_name)
    .post('/intervention/envoyerIntervention', authController.protect, authController.restricTo('cco_agent', 'admin'), interventionController.envoyerIntervention)
    .post('/intervention/envoyerInterventionAuChef', authController.protect, authController.restricTo('cco_agent', 'admin'), interventionController.envoyerInterventionAuChef)
    .post('/intervention/getIntervention_details', authController.protect, authController.restricTo('cco_agent', 'admin'), interventionController.getIntervention_details)
    .get("/intervention/getInterventionByChef/:id_team?", authController.protect, interventionController.getInterventionByChef)
    .post("/intervention/updateInterventionByChef/:id_intervention", authController.protect, interventionController.updateInterventionByChef)
    .post("/intervention/updateInterventionStatus/:id_intervention", authController.protect, interventionController.updateInterventionStatus)
    .get("/test", interventionController.test)


module.exports = router;