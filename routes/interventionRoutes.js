const express = require('express');
const interventionController = require('../controllers/interventionController');
const authController = require('../controllers/authController');
const appelController = require('../controllers/appelController');
const router = express.Router();


router
    .post('/getAllIntervention', interventionController.getAllInterventions)
    // .post('/getIntervention', interventionController.getIntervention)
    .post('/addDateTimeDepart', authController.protect, authController.restricTo('chef'), appelController.addDateTimeDepart)



module.exports = router;