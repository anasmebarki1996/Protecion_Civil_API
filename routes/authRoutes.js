const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();



router
    .post('/login', authController.login)
    .post('/logout', authController.logout)
    .post('/checkToken', authController.protect, authController.checkToken)

module.exports = router;