const express = require('express');
const hospitalController = require('../controllers/hospitalController');
const authController = require('../controllers/authController');
const router = express.Router();



router
    .get('/hospital', hospitalController.getAllHospitals)
    .get('/hospital/:id', hospitalController.getHospital)
    .post('/hospital/', hospitalController.addHospital)
    .patch('/hospital/:id', hospitalController.modifyHospital)
    .delete('/hospital/:id', hospitalController.deleteHospital)
    



module.exports = router;