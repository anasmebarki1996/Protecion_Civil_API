const Engin = require("../models/enginModel");
const Unite = require("../models/uniteModel");
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require("../utils/appError");
const {
    Types: {
        ObjectId
    },
} = (mongoose = require("mongoose"));
exports.createEngin = catchAsync(async (req, res, next) => {

    await Engin.create({
        name: req.body.name,
        code_name: req.body.code_name,
        matricule: req.body.matricule,
        id_unite: req.body.id_unite,
    });

    res.status(200).json({
        status: "success",
    });
});

exports.changeStatutPanne = catchAsync(async (req, res, next) => {
    if (req.unite.type == "principale") req.unite.query_unite['$in'].push(ObjectId(req.unite._id))
    await Engin.findOneAndUpdate({
        _id: req.body.id_engin,
        id_unite: req.unite.query_unite
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
    const engin_name_list = await Engin.distinct("name")
    const engin_code_name_list = await Engin.distinct("code_name")
    // let enginssss = []
    // if (req.unite.type == "secondaire") {
    //     enginssss = Engin.find({
    //         id_unite: req.agent.id_unite
    //     })
    // } else {
    //     let unites;
    //     let unite;
    //     if (req.body.id_unite) {
    //         unites = await Unite.find({
    //             $or: [{
    //                 unite_principale: ObjectId(req.unite._id),
    //                 _id: ObjectId(req.body.id_unite)
    //             }, {
    //                 _id: ObjectId(req.body.id_unite)
    //             }]
    //         }, {
    //             _id: 1,
    //         });
    //         unite = unites.map((x) => ObjectId(x._id));
    //     } else {
    //         unites = await Unite.find({
    //             unite_principale: ObjectId(req.unite._id),
    //         }, {
    //             _id: 1,
    //         });
    //         unite = unites.map((x) => ObjectId(x._id));
    //         unite.push(ObjectId(req.unite._id));
    //     }
    //     enginssss = Engin.find({
    //         id_unite: {
    //             $in: unite
    //         }
    //     })
    // }



    if (req.unite.type == "principale") req.unite.query_unite['$in'].push(ObjectId(req.unite._id))


    if (req.body.id_unite) {
        if (req.unite.type == "principale") {
            for (let i = 0; i < req.unite.query_unite['$in'].length; i++) {
                if (req.body.id_unite == req.unite.query_unite['$in'][i]) {
                    req.unite.query_unite = ObjectId(req.body.id_unite)
                    break;
                }
            }

        } else if (req.unite.type == "secondaire" && req.agent.id_unite == req.body.id_unite) {
            req.unite.query_unite = ObjectId(req.body.id_unite)
        } else {
            return next(
                new AppError("Vous n'avez pas la permission", 403)
            )
        }

    }

    let engins = Engin.find({
        id_unite: req.unite.query_unite
    })
    const engins_length = await Engin.countDocuments(engins.getQuery());
    const features = new APIFeatures(engins, req.query).search().paginate().sort();
    engins = await features.query;

    res.status(200).json({
        status: "success",
        engins,
        engins_total: engins_length,
        engin_name_list: engin_name_list,
        engin_code_name_list: engin_code_name_list
    });
});

exports.updatePanne = catchAsync(async (req, res, next) => {
    console.log("update panne is duplicated verify with zaki")
    if (req.unite.type == "principale") {
        const unite = await Unite.findOne({
            nom: req.body.nom_unite,
            unite_principale: req.agent.id_unite
        });
        if (unite) {
            req.agent.id_unite = unite._id;
        }
    }
    await Engin.findByIdAndUpdate({
        _id: req.body.id_engin,
        id_unite: req.agent.id_unite
    }, {
        $set: {
            panne: req.body.nouveauStatutPanne
        }
    });

    res.status(200).json();
});

exports.updateEngin = catchAsync(async (req, res, next) => {
    if (req.unite.type == "principale" && req.body.id_unite) {
        const unite = await Unite.findOne({
            $or: [{
                    _id: ObjectId(req.body.id_unite),
                    unite_principale: req.agent.id_unite,
                    type: "secondaire"
                },
                {
                    _id: ObjectId(req.body.id_unite),
                    type: "principale"
                }
            ]
        });
        if (unite) {
            if (unite._id != req.agent.id_unite && unite.type == "principale") {
                return next(
                    new AppError("Vous n'avez pas la permission", 403)
                )
            }
            req.agent.id_unite = unite._id;
        }
    }

    if (req.unite.type == "principale") req.unite.query_unite['$in'].push(ObjectId(req.unite._id))

    await Engin.findOneAndUpdate({
        _id: req.body.id_engin,
        id_unite: req.unite.query_unite
    }, {
        $set: {
            name: req.body.name,
            code_name: req.body.code_name,
            matricule: req.body.matricule,
            id_unite: req.agent.id_unite,
        }
    });
    // if (req.unite.type == "principale" && req.body.id_unite) {
    //     const unite = await Unite.findOne({
    //         nom: req.body.nom_unite,
    //         unite_principale: req.agent.id_unite
    //     });
    //     if (unite) {
    //         req.agent.id_unite = unite._id;
    //         await Engin.findByIdAndUpdate({
    //             _id: req.body.id_engin,
    //             id_unite: req.agent.id_unite
    //         }, {
    //             $set: {
    //                 name: req.body.name,
    //                 code_name: req.body.code_name,
    //                 matricule: req.body.matricule,
    //                 id_unite: req.agent.id_unite,
    //             }
    //         });
    //     }
    // } else {
    //     await Engin.findByIdAndUpdate({
    //         _id: req.body.id_engin,
    //         id_unite: req.agent.id_unite
    //     }, {
    //         $set: {
    //             name: req.body.name,
    //             code_name: req.body.code_name,
    //             matricule: req.body.matricule,
    //         }
    //     });
    // }


    res.status(200).json({
        status: "success",
    });
});

exports.deleteEngin = catchAsync(async (req, res, next) => {
    await Engin.deleteOne({
        _id: req.body.id_engin,
        id_unite: req.unite.query_unite
    });

    res.status(200).json();
});

exports.engin_name_list = catchAsync(async (req, res, next) => {
    const engin_name_list = await Engin.distinct("name")
    const engin_code_name_list = await Engin.distinct("code_name")


    res.status(200).json({
        status: "success",
        engin_name_list: engin_name_list,
        engin_code_name_list: engin_code_name_list
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
                        $concat: ["$name", "$code_name", " ---", "$matricule"]
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