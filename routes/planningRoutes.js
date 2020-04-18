const express = require('express');
const planningController = require('../controllers/planningController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .post('/createPlanning', authController.protect, planningController.createPlanning)
    .post('/addTeam', authController.protect, planningController.addTeam)
    .post('/getTeams', authController.protect, planningController.getTeams)


module.exports = router;