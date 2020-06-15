const express = require('express');
const agentController = require('../controllers/agentController');
const authController = require('../controllers/authController');
const router = express.Router();



router
    .post('/createAgent', authController.protect, authController.checkUnite, agentController.createAgent)
    .post('/deleteAgent', authController.protect, authController.checkUnite, agentController.deleteAgent)
    .post('/getAgent/:id?', authController.protect, authController.checkUnite, agentController.getAgent)
    .post('/searchAgent', authController.protect, agentController.searchAgent)
    .post('/getAllAgents', authController.protect, authController.checkUnite, agentController.getAllAgents)
    .post('/updatePersonnelAgent', authController.protect, authController.checkUnite, agentController.updatePersonnelAgent)
    .post('/updateCompteAgent', authController.protect, authController.checkUnite, agentController.updateCompteAgent)
    .post('/updatePasswordAgent', authController.protect, authController.checkUnite, agentController.updatePasswordAgent)


module.exports = router;