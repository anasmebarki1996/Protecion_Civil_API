const express = require('express');
const teamController = require('../controllers/teamController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .post('/team/getTeamID', authController.protect, teamController.getTeamID)
    .post('/team/getTeam', authController.protect, teamController.getTeam)
    .post('/team/getAdresseAllTeams', authController.protect, teamController.getAdresseAllTeams)
    .post('/team/getAdresseTeam', authController.protect, teamController.getAdresseTeam)
    .post('/team/setAdresseTeam', authController.protect, teamController.setAdresseTeam)

    .post('/team/getTeamsDisponible', authController.protect, teamController.getTeamsDisponible)
    .get('/team/:id?',authController.protect,teamController.getTeamAndroid)


module.exports = router;