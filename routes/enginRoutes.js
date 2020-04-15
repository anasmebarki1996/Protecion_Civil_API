const express = require('express');
const enginController = require('../controllers/enginController');
const authController = require('../controllers/authController');
const router = express.Router();

router
    .post('/createEngin', authController.protect, enginController.createEngin)


module.exports = router;