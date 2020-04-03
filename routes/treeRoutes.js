const express = require('express');
const treeController = require('../controllers/treeController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .post('/createTree', treeController.createTree)
    .post('/getAllTree', treeController.getAllTree)

module.exports = router;