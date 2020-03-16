const express = require('express');
const interventionController = require('../controllers/interventionController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .route('/intervention')
    .get(authController.protect, interventionController.getAllInterventions)
    .post(authController.protect, interventionController.createIntervention)



module.exports = router;