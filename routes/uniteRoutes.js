const express = require('express');
const uniteController = require('../controllers/uniteController');
const authController = require('../controllers/authController');
const router = express.Router();



router
    .post('/createUnite', authController.protect, uniteController.createUnite)
    .post('/getUnite', uniteController.getUnite)
    .post('/updateInformationUnite', authController.protect, uniteController.updateInformationUnite)
    .post('/getListUnite', authController.protect, uniteController.getListUnite)
    .post('/getListUnitePrincipaleAndSesSecondaire', authController.protect, uniteController.getListUnitePrincipaleAndSesSecondaire)
    .post('/updateChef_unite', authController.protect, uniteController.updateChef_unite)
    .post('/updateTypeUnite', authController.protect, uniteController.updateTypeUnite)
    .post('/getUnitePlusProche', uniteController.getUnitePlusProche)


module.exports = router;