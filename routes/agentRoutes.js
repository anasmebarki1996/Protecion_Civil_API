const express = require('express');
const agentController = require('../controllers/agentController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .route('/')
    .get(agentController.getAllAgents)

router
    .post('/createAgent', authController.protect, authController.restricTo('admin'), agentController.createAgent)
    .post('/login', authController.login)
    .post('/logout', authController.logout)

module.exports = router;