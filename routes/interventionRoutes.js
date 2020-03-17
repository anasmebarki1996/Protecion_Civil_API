const express = require('express');
const interventionController = require('../controllers/interventionController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .route('/intervention')
    .get(authController.protect, authController.restricTo('admin'), interventionController.getAllInterventions)

router
    .post('/updatedateTimeDepart', authController.protect, authController.restricTo('chef'), appelController.updatedateTimeDepart)



module.exports = router;