const express = require('express');
const planningController = require('../controllers/planningController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .post('/planning/addTeam', authController.protect, planningController.addTeam)
    .post('/planning/deleteTeam', authController.protect, planningController.deleteTeam)
    .post('/planning/getPlanning', authController.protect, planningController.getPlanning)
    .post('/planning/getTeam', authController.protect, planningController.getTeam)
    .post('/planning/deleteChauffeur', authController.protect, planningController.deleteChauffeur)
    .post('/planning/addChauffeur', authController.protect, planningController.addChauffeur)
    .post('/planning/deleteChef', authController.protect, planningController.deleteChef)
    .post('/planning/addChef', authController.protect, planningController.addChef)
    .post('/planning/addEngin', authController.protect, planningController.addEngin)
    .post('/planning/deleteEngin', authController.protect, planningController.deleteEngin)
    .post('/planning/addSecours', authController.protect, planningController.addSecours)
    .post('/planning/deleteSecours', authController.protect, planningController.deleteSecours)
    .post('/planning/updateDate', authController.protect, planningController.updateDate)
    .post('/planning/getAdresseTeam', authController.protect, planningController.getAdresseTeam)
    .post('/planning/getTeamID', authController.protect, planningController.getTeamID)


module.exports = router;