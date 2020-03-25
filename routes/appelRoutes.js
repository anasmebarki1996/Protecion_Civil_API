const express = require('express');
const appelController = require('../controllers/appelController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .post('/nouveauAppel', appelController.nouveauAppel)
    .post('/getAppel', authController.protect, authController.restricTo('admin'), appelController.getAppel)

module.exports = router;