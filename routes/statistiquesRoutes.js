const express = require('express');
const statistiqueController = require('../controllers/statistiqueController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .post('/statistique/getInterventionStatistiques', authController.protect, authController.checkUnite, statistiqueController.getInterventionStatistiques)
    .post('/statistique/getInterventionHeatMap', authController.protect, authController.checkUnite, statistiqueController.getInterventionHeatMap)


module.exports = router;