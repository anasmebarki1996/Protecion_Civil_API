const express = require('express');
const agentController = require('../controllers/agentController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .route('/')
    .get(agentController.getAllAgents)

router
    .post('/createAgent', agentController.createAgent)
    .post('/login', authController.login)
    .post('/logout', authController.logout)
    .post('/checkToken', authController.protect, authController.checkToken)
    .post('/searchAgent', authController.protect, agentController.searchAgent)

module.exports = router;