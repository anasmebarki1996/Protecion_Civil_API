const express = require('express');
const interventionController = require('../controllers/interventionController');
const authController = require('../controllers/authController');
const appelController = require('../controllers/appelController');
const router = express.Router();


router
    .route('/intervention')
    .get(authController.protect, authController.restricTo('admin'), interventionController.getAllInterventions)

router
    .post('/addDateTimeDepart', authController.protect, authController.restricTo('chef'), appelController.addDateTimeDepart)



module.exports = router;