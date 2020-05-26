const express = require('express');
const treeController = require('../controllers/treeController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .get('/tree', authController.protect, treeController.displayTree) //returns the graph of all the tree
    .get('/tree/nodes/:parent_id?', authController.protect, treeController.getNodes) //return nodes of a specified parent
    .get('/tree/node/:id?', authController.protect, treeController.getNode) //return node with id
    .get('/tree/path/:child_id?', authController.protect, treeController.getNodePath) //return nodes of a specified parent
    .post('/tree', authController.protect, authController.restricTo('admin'), treeController.createNode)
    .put('/tree/:id?', authController.protect, authController.restricTo('admin'), treeController.updateNode)
    .delete('/tree/:id?', authController.protect, authController.restricTo('admin'), treeController.deleteNode)
    .get('/engin', authController.protect, treeController.getAllEngins)
module.exports = router;