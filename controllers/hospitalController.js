const Hopital = require("../models/hospitalModel");
const dateTime = require("../utils/moment").dateTime;
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

const {
    Types: {
        ObjectId
    },
} = (mongoose = require("mongoose"));

exports.getAllHospitals = catchAsync(async (req, res, next) => {
    const hospitals = await Hopital.find();
    if (!hospitals) {
        return next(new AppError("la liste des hopitaux est vide.", 404));
    }
    res.status(200).json(hospitals)
});

exports.getHospital = catchAsync(async (req, res, next) => {
    const id = req.params.id || null
    const hospital = await Hopital.findOne({
        _id: ObjectId(id)
    });
    if (!hospital) {
        return next(new AppError("l'hopital avec cette id n'existe pas.", 404));
    }
    res.status(200).json(hospital)
});



exports.addHospital = catchAsync(async (req, res, next) => {
    const hospital = await Hopital.create({
        name: req.body.name,
        gps_coordonnee: {
            lat: req.body.gps_coordonnee.lat,
            lng: req.body.gps_coordonnee.lng,
        },
        numTel: req.body.numTel,

        created_at: dateTime
    });

    if (!hospital) {
        return next(new AppError("l'hopital avec cette id n'existe pas.", 404));
    }


    res.status(200).json(hospital)

});



exports.modifyHospital = catchAsync(async (req, res, next) => {


    const id = req.params.id || null

    await Hopital.findOneAndUpdate({
        _id: id
    }, req.body);
    const hospital = await Hopital.findOne({
        _id: id
    });

    if (!hospital) {
        return next(new AppError("l'hopital avec cette id n'existe pas.", 404));
    }


    res.status(200).json(hospital)

});



exports.deleteHospital = catchAsync(async (req, res, next) => {

    const id = req.params.id

    const hospital = await Hopital.findOneAndDelete({
        _id: id
    }, (err, ress) => {
        if (err) {
            return next(new AppError("n'a pas pu supprimer l'hôpital", err.status));
        }

        res.status(200).json({
            success: "hôpital supprimé avec succès"
        })

    })








});