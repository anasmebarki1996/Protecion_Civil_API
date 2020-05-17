const express = require('express');
const planningController = require('../controllers/planningController');
const authController = require('../controllers/authController');
const router = express.Router();


router

    .post('/planning/getPlanning', authController.protect, planningController.getPlanning)
    .post('/planning/deleteChauffeur', authController.protect, planningController.deleteChauffeur)
    .post('/planning/addChauffeur', authController.protect, planningController.addChauffeur)
    .post('/planning/deleteChef', authController.protect, planningController.deleteChef)
    .post('/planning/addChef', authController.protect, planningController.addChef)
    .post('/planning/addEngin', authController.protect, planningController.addEngin)
    .post('/planning/deleteEngin', authController.protect, planningController.deleteEngin)
    .post('/planning/addSecours', authController.protect, planningController.addSecours)
    .post('/planning/deleteSecours', authController.protect, planningController.deleteSecours)
    .post('/planning/updateDate', authController.protect, planningController.updateDate)
    .post('/planning/addTeam', authController.protect, planningController.addTeam)
    .post('/planning/deleteTeam', authController.protect, planningController.deleteTeam)


module.exports = router;