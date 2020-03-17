const express = require('express');
const appelController = require('../controllers/appelController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .post('/nouveauAppel', appelController.nouveauAppel)
    .get('/appel', authController.protect, authController.restricTo('cco_agent'), authController.getAppel)

module.exports = router;