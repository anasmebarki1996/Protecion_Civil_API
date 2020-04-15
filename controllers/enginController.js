const Engin = require("../models/enginModel");
const catchAsync = require('../utils/catchAsync');

exports.createEngin = catchAsync(async (req, res, next) => {
    const engin = await Engin.create({
        type: req.body.type,
        matricule: req.body.matricule,
        id_unite: req.agent.id_unite,
        username: "anasmebarki1996"
    });

    res.status(200).json({
        status: "success",
        engin
    });
});

exports.updatePanne = catchAsync(async (req, res, next) => {
    await Engin.findByIdAndUpdate({
        _id: req.body.id_engin,
    }, {
        $set: {
            panne: req.body.nouveauStatutPanne
        }
    });

    res.status(200).json({
        status: "success",
    });
});


exports.updateEngin = catchAsync(async (req, res, next) => {
    await Engin.findByIdAndUpdate({
        _id: req.body.id_engin,
    }, {
        $set: {
            type: req.body.type,
            matricule: req.body.matricule,
            id_unite: req.agent.id_unite,
        }
    });

    res.status(200).json({
        status: "success",
    });
});

exports.searchEngin = catchAsync(async (req, res, next) => {
    const engins = await Engin.aggregate(
        [{
                $match: {
                    id_unite: req.agent.id_unite,
                    panne: false,
                }
            },
            {
                $project: {
                    result: {
                        $concat: ["$matricule", " ---", "$type"]
                    }
                }
            }
        ]
    );
    res.status(200).json({
        status: "success",
        engins
    });
});