const express = require('express');
const treeController = require('../controllers/treeController');
const authController = require('../controllers/authController');
const router = express.Router();

/*
router
    .post('/createTree', treeController.createTree)
    .get('/tree', treeController.getAllTree)
    .put('/tree',treeController.updateTree)
*/

router
    .get('/tree',treeController.displayTree) //returns the graph of all the tree
    .get('/tree/nodes',treeController.getNodes) //return nodes of a specified parent
    .post('/tree',treeController.createNode)
    .put('/tree',treeController.updateNode)
    .delete('/tree',treeController.deleteNode)
module.exports = router;