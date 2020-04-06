const Tree = require("../models/treeModel");
const catchAsync = require('../utils/catchAsync');

exports.getAllTree = catchAsync(async (req, res) => {
    const tree = await Tree.find();
    res.status(200).json({
        status: "success",
        data: {
            tree
        }
    })
});



exports.createTree = catchAsync(async (req, res, next) => {
    console.log(req.body)
    const newTree = await Tree.create({
        niv1: {
            niv1_type: req.body.niv1_type,
            niv2: [{
                niv2_type: req.body.niv2_type,
                decision: {
                    protection: req.body.engin,
                    securite: req.body.securite,
                    sante: req.body.sante
                }
            }]
        }
    });

    res.status(200).json({
        status: "success",
        newTree
    });
});