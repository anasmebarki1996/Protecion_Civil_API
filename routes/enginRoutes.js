const express = require('express');
const enginController = require('../controllers/enginController');
const authController = require('../controllers/authController');
const router = express.Router();

router
    .post('/createEngin', authController.protect, authController.restricTo('admin', 'cco_agent'), authController.checkUnite, enginController.createEngin)
    .post('/getListEngin', authController.protect, authController.checkUnite, enginController.getListEngin)
    .get('/engin', authController.protect, enginController.getListEngin) //return the list of engins cRud
    .post('/updatePanne', authController.protect, authController.restricTo('admin', 'cco_agent'), authController.checkUnite, enginController.updatePanne)
    .post('/updateEngin', authController.protect, authController.restricTo('admin', 'cco_agent'), authController.checkUnite, enginController.updateEngin)
    .post('/searchEngin', authController.protect, authController.checkUnite, enginController.searchEngin)
    .post('/changeStatutPanne', authController.protect, authController.restricTo('admin', 'cco_agent'), authController.checkUnite, enginController.changeStatutPanne)
    .post('/deleteEngin', authController.protect, authController.restricTo('admin', 'cco_agent'), authController.checkUnite, enginController.deleteEngin)
module.exports = router;