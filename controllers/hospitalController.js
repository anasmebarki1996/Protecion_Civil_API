const Hopital = require("../models/hospitalModel");
const dateTime = require("../utils/moment").dateTime;
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const Hospital = require("../models/hospitalModel");

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



exports.createHospital = catchAsync(async (req, res, next) => {
    // const hospital = await Hopital.create({
    await Hopital.create({
        name: req.body.name,
        gps_coordonnee: {
            lat: req.body.gps_coordonnee.lat,
            lng: req.body.gps_coordonnee.lng,
        },
        numTel: req.body.numTel,
        created_at: dateTime
    });

    // if (!hospital) {
    //     return next(new AppError("l'hopital avec cette id n'existe pas.", 404));
    // }
    // res.status(200).json(hospital)
    res.status(200).json()
});



exports.updateHospital = catchAsync(async (req, res, next) => {
    await Hopital.findOneAndUpdate({
        _id: req.body.id_hospital
    }, {
        name: req.body.name,
        gps_coordonnee: {
            lat: req.body.gps_coordonnee.lat,
            lng: req.body.gps_coordonnee.lng,
        },
        numTel: req.body.numTel,
    });
    res.status(200).json()
});


exports.deleteHospital = catchAsync(async (req, res, next) => {
    await Hopital.findOneAndDelete({
        _id: req.body.id_hospital
    });
    res.status(200).json()
});


// ################### Anas partie ########################

exports.getListHospital = catchAsync(async (req, res, next) => {
    let hospitals = Hospital.find();
    const hospitals_length = await Hospital.countDocuments(hospitals.getQuery());
    const features = new APIFeatures(hospitals, req.query).search().paginate().sort();
    hospitals = await features.query;
    if (!hospitals) {
        return next(new AppError("la liste des hopitaux est vide.", 404));
    }
    res.status(200).json({
        hospitals: hospitals,
        hospitals_length: hospitals_length
    })
});