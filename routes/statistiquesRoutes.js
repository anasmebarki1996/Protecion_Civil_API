const express = require('express');
const statistiqueController = require('../controllers/statistiqueController');
const authController = require('../controllers/authController');
const appelController = require('../controllers/appelController');
const router = express.Router();


router
    .post('/statistique/getInterventionParJour', authController.protect, authController.checkUnite, statistiqueController.getInterventionParJour)
    .post('/statistique/getInterventionParMois', authController.protect, authController.checkUnite, statistiqueController.getInterventionParMois)


module.exports = router;