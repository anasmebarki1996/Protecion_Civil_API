const Engin = require("../models/enginModel");
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures')

exports.createEngin = catchAsync(async (req, res, next) => {
    const engin = await Engin.create({
        code_name: req.body.code_name,
        matricule: req.body.matricule,
        id_unite: req.agent.id_unite,
        username: "anasmebarki1996"
    });

    res.status(200).json({
        status: "success",
        engin
    });
});


exports.changeStatutPanne = catchAsync(async (req, res, next) => {
    await Engin.findOneAndUpdate({
        _id: req.body.id_engin,
        id_unite: req.agent.id_unite
    }, {
        $set: {
            panne: !req.body.panne
        }
    })
    res.status(200).json({
        status: "success",
    });
});



exports.getListEngin = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Engin.find({
        id_unite: req.agent.id_unite
    }), req.query).search().paginate().sort();
    const engins = await features.query;

    res.status(200).json({
        status: "success",
        engins,
        engins_total: engins.length
    });
});

exports.updatePanne = catchAsync(async (req, res, next) => {
    await Engin.findByIdAndUpdate({
        _id: req.body.id_engin,
        id_unite: req.agent.id_unite
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
        id_unite: req.agent.id_unite
    }, {
        $set: {
            code_name: req.body.code_name,
            matricule: req.body.matricule,
            id_unite: req.agent.id_unite,
        }
    });

    res.status(200).json({
        status: "success",
    });
});

exports.deleteEngin = catchAsync(async (req, res, next) => {
    await Engin.deleteOne({
        _id: req.body.id_engin,
        id_unite: req.agent.id_unite
    });

    res.status(200).json({
        status: "success",
    });
});


exports.searchEngin = catchAsync(async (req, res, next) => {
    console.log("search engin : on doit verifier si les engins sont deja pris pour ce jour")
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
                        $concat: ["$code_name", " ---", "$matricule"]
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