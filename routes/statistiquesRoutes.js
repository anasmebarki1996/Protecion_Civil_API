const express = require('express');
const statistiqueController = require('../controllers/statistiqueController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .post('/statistique/getInterventionStatistiques', authController.protect, authController.checkUnite, statistiqueController.getInterventionStatistiques)
    .post('/statistique/getInterventionHeatMap', authController.protect, authController.checkUnite, statistiqueController.getInterventionHeatMap)
    .post('/statistique/getUnitesQuiALePlusDinterventionParMois', authController.protect, authController.checkUnite, statistiqueController.getUnitesQuiALePlusDinterventionParMois)
    .post('/statistique/getMeilleureTempsDeReposnseParMois', authController.protect, authController.checkUnite, statistiqueController.getMeilleureTempsDeReposnseParMois)
    .post('/statistique/getStatistiques', authController.protect, authController.checkUnite, statistiqueController.getStatistiques)


module.exports = router;