const Unite = require("../models/uniteModel");
const Planning = require("../models/planningModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const {
    Types: {
        ObjectId
    },
} = (mongoose = require("mongoose"));

exports.createUnite = catchAsync(async (req, res, next) => {
    await Unite.create({
        nom: req.body.nom,
        adresse: {
            wilaya: req.body.adresse.wilaya,
            daira: req.body.adresse.daira,
            adresse_rue: req.body.adresse.adresse_rue,
            gps_coordonnee: {
                lat: req.body.adresse.gps_coordonnee.lat,
                lng: req.body.adresse.gps_coordonnee.lng,
            },
        },
        type: req.body.type,
    });

    res.status(200).json({
        status: "success",
    });
});

exports.getUnite = catchAsync(async (req, res, next) => {
    const unite = await Unite.findOne({
        _id: req.body.id_unite,
    });

    res.status(200).json({
        status: "success",
        unite
    });

});


exports.updateChef_unite = catchAsync(async (req, res, next) => {
    await Unite.findOneAndUpdate({
        _id: req.body.id_unite,
    }, {
        $set: {
            chef_unite: req.body.id_chef_unite,
        },
    });

    res.status(200).json({
        status: "success",
    });
});

exports.updateTypeUnite = catchAsync(async (req, res, next) => {
    await Unite.findOneAndUpdate({
        _id: req.body.id_unite,
    }, {
        $set: {
            type: req.body.type,
            unite_principale: req.body.id_unite_principale,
        },
    });

    res.status(200).json({
        status: "success",
    });
});

exports.updateInformationUnite = catchAsync(async (req, res, next) => {
    await Unite.findOneAndUpdate({
        _id: req.body.id_unite,
    }, {
        $set: {
            nom: req.body.nom,
            adresse: {
                wilaya: req.body.wilaya,
                daira: req.body.daira,
                adresse_rue: req.body.adresse_rue,
                gps_coordonnee: {
                    lat: req.body.gps_coordonnee.lat,
                    lng: req.body.gps_coordonnee.lng,
                },
            },
        },
    });

    res.status(200).json({
        status: "success",
    });
});

exports.getUnitePlusProche = catchAsync(async (req, res, next) => {
    if (
        !isFinite(req.body.lat) ||
        req.body.lat > 37 ||
        req.body.lat < 19 ||
        !isFinite(req.body.lng) ||
        req.body.lng > 11.9 ||
        req.body.lng < -8.7
    ) {
        return next(new AppError("les cordonnées ne sont pas valides", 403));
    }
    let unites_initial = [],
        unites_final = [],
        resultat_initial = [],
        resultat_final = [];
    let distance = 2;
    do {
        // ############# on cherche les unites les plus proches et qui ne sont pas déja pris #############

        unites_initial = await Unite.find({
            "adresse.gps_coordonnee.lat": {
                $gte: req.body.lat - distance,
                $lte: req.body.lat + distance,
            },
            "adresse.gps_coordonnee.lng": {
                $gte: req.body.lng - distance,
                $lte: req.body.lng + distance,
            },
            type: "secondaire"
        }, {
            _id: 1,
        });
        distance *= 2;

        unites_initial = unites_initial.map((x) => ObjectId(x._id));
        for (var i = 0; i < unites_initial.length && unites_final.length; i++) {
            if (unites_final.includes(unites_initial[i])) {
                unites_initial.splice(i, 1);
                i--;
            }
        }
        unites_final = unites_final.concat(unites_initial);

        //  ##################################
        // si il y a aucune unites trouvée faut pas chercher les engins
        if (unites_initial.length) {
            resultat_initial = await Planning.aggregate([{
                    $unwind: "$calendrier",
                },
                {
                    $match: {
                        "calendrier.date": new Date("2020-04-02"),
                        id_unite: {
                            $in: unites_initial,
                        },
                    },
                },
                {
                    $unwind: "$calendrier.team",
                },
                {
                    $project: {
                        _id: 0,
                        id_unite: 1,
                        "calendrier.team.engin": 1,
                        "calendrier.team.disponibilite": 1,
                    },
                },
                {
                    $lookup: {
                        from: "engins",
                        let: {
                            engin: "$calendrier.team.engin",
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$engin"],
                                    },
                                },
                            },
                            {
                                $project: {
                                    code_name: 1,
                                },
                            },
                        ],
                        as: "calendrier.team.engin",
                    },
                },
                {
                    $match: {
                        "calendrier.team.disponibilite": true,
                    },
                },
                {
                    $project: {
                        id_unite: 1,
                        engin: "$calendrier.team.engin.code_name",
                    },
                },
                {
                    $unwind: "$engin",
                },
                {
                    $group: {
                        _id: {
                            id_unite: "$id_unite",
                            engin: "$engin",
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $group: {
                        _id: "$_id.id_unite",
                        engins: {
                            $push: {
                                code_name: "$_id.engin",
                                nombre: "$count",
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: "unites",
                        let: {
                            id_unite: "$_id",
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$id_unite"],
                                    },
                                },
                            },
                            {
                                $project: {
                                    adresse: 1,
                                    nom: 1
                                },
                            },
                        ],
                        as: "unite",
                    },
                },
                {
                    $unwind: "$unite",
                },
                {
                    $project: {
                        _id: 0,
                        id_unite: "$_id",
                        engins: 1,
                        adresse: "$unite.adresse",
                        nom_unite: "$unite.nom"
                    },
                },
            ]);

            resultat_final = resultat_final.concat(resultat_initial);
        }
    } while (resultat_final.length <= 0 && distance <= 5);

    if (distance > 5) {
        return next(new AppError("Error , il n'y aucune unite disponible", 403));
    }

    res.status(200).json({
        status: "success",
        unites: resultat_final,
    });
});