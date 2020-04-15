const express = require('express');
const planningController = require('../controllers/planningController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .post('/createPlanning', planningController.createPlanning)


module.exports = router;