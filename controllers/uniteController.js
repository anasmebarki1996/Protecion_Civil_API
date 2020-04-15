const Unite = require("../models/uniteModel");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createUnite = catchAsync(async (req, res, next) => {

    console.log(req.body.gps_coordonnee)
    await Unite.create({
        nom: req.body.nom,
        adresse: {
            willaya: req.body.adresse.willaya,
            daira: req.body.adresse.daira,
            adresse_rue: req.body.adresse.adresse_rue,
            gps_coordonnee: {
                latitude: req.body.adresse.gps_coordonnee.latitude,
                longitude: req.body.adresse.gps_coordonnee.longitude
            },
        },
        type: req.body.type,
    });

    res.status(200).json({
        status: "success",
    });

});

exports.updateChef_unite = catchAsync(async (req, res, next) => {

    await Unite.findOneAndUpdate({
        _id: req.body.id_unite,
    }, {
        $set: {
            chef_unite: req.body.id_chef_unite
        }
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
            unite_principale: req.body.id_unite_principale
        }
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
                willaya: req.body.willaya,
                daira: req.body.daira,
                adresse_rue: req.body.adresse_rue,
                gps_coordonnee: {
                    latitude: req.body.gps_coordonnee.latitude,
                    longitude: req.body.gps_coordonnee.longitude
                },
            },
        }
    });

    res.status(200).json({
        status: "success",
    });

});