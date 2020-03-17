const express = require('express');
const agentController = require('../controllers/agentController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .route('/')
    .get(authController.protect, agentController.getAllAgents)

router
    .post('/signup', authController.protect, authController.restricTo('admin'), authController.signUp)
    .post('/login', authController.login)
    .post('/logout', authController.logout)

module.exports = router;