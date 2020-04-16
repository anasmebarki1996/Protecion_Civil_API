const express = require('express');
const enginController = require('../controllers/enginController');
const authController = require('../controllers/authController');
const router = express.Router();

router
    .post('/createEngin', authController.protect, enginController.createEngin)
    .post('/getListEngin', authController.protect, enginController.getListEngin)
    .post('/updatePanne', authController.protect, enginController.updatePanne)
    .post('/updateEngin', authController.protect, enginController.updateEngin)
    .post('/searchEngin', authController.protect, enginController.searchEngin)
    .post('/changeStatutPanne', authController.protect, enginController.changeStatutPanne)
    .post('/deleteEngin', authController.protect, enginController.deleteEngin)
module.exports = router;