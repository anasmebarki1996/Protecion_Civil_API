const express = require('express');
const uniteController = require('../controllers/uniteController');
const authController = require('../controllers/authController');
const router = express.Router();



router
    .post('/createUnite', uniteController.createUnite)
    .post('/updateChef_unite', uniteController.updateChef_unite)
    .post('/updateTypeUnite', uniteController.updateTypeUnite)
    .post('/updateInformationUnite', uniteController.updateInformationUnite)
    .post('/getUnitePlusProche', uniteController.getUnitePlusProche)


module.exports = router;