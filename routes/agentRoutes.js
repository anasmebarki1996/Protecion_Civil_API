const express = require('express');
const agentController = require('../controllers/agentController');
const authController = require('../controllers/authController');
const router = express.Router();



router
    .post('/createAgent', authController.protect, authController.checkUnite, agentController.createAgent)
    .post('/deleteAgent', authController.protect, authController.checkUnite, agentController.deleteAgent)
    .post('/getAgent/:id?', authController.protect, agentController.getAgent)
    .post('/searchAgent', authController.protect, agentController.searchAgent)
    .post('/getAllAgents', authController.protect, authController.checkUnite, agentController.getAllAgents)
    .post('/updatePersonnelAgent', authController.protect, agentController.updatePersonnelAgent)
    .post('/updateCompteAgent', authController.protect, agentController.updateCompteAgent)
    .post('/updatePasswordAgent', authController.protect, agentController.updatePasswordAgent)


module.exports = router;