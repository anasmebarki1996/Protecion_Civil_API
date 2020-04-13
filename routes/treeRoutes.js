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
    .get('/tree/nodes/:parent_id?',treeController.getNodes) //return nodes of a specified parent
    .get('/tree/path/:child_id?',treeController.getNodePath) //return nodes of a specified parent
    .post('/tree',treeController.createNode)
    .put('/tree/:id?',treeController.updateNode)
    .delete('/tree',treeController.deleteNode)
    .get('/engin',treeController.getAllEngins)
module.exports = router;