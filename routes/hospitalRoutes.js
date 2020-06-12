const express = require('express');
const hospitalController = require('../controllers/hospitalController');
const authController = require('../controllers/authController');
const router = express.Router();



router
    .get('/hospital', hospitalController.getAllHospitals)
    .get('/hospital/:id', hospitalController.getHospital)
    .post('/createHospital', hospitalController.createHospital)
    .post('/updateHospital', hospitalController.updateHospital)
    .post('/deleteHospital', hospitalController.deleteHospital)
    .get('/getListHospital', hospitalController.getListHospital)


module.exports = router;