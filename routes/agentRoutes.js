const express = require('express');
const agentController = require('../controllers/agentController');
const authController = require('../controllers/authController');
const router = express.Router();



router
    .post('/createAgent', agentController.createAgent)
    .post('/login', authController.login)
    .post('/logout', authController.logout)
    .post('/checkToken', authController.protect, authController.checkToken)
    .post('/searchAgent', authController.protect, agentController.searchAgent)
    .post('/getAllAgents', authController.protect, agentController.getAllAgents)

module.exports = router;