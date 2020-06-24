const Appel = require("../models/appelModel");
const Intervention = require("../models/interventionModel");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const dateTime = require("../utils/moment").dateTime;
const moment = require("../utils/moment").moment;

exports.nouveauAppel = catchAsync(async (req, res, next) => {

    if (req.body.gps_coordonnee.lat && req.body.gps_coordonnee.lng && req.body.numTel) {
        console.log(dateTime)
        await Appel.findOneAndDelete({
            numTel: req.body.numTel,
        })
        await Appel.create({
            numTel: req.body.numTel,
            gps_coordonnee: {
                lat: req.body.gps_coordonnee.lat,
                lng: req.body.gps_coordonnee.lng
            },
        });

        res.status(200).json({
            status: "success",
        });
    } else {
        return next(new AppError("Vous devriez activer le GPS! S'il vous plait", 401));
    }
});

exports.getAppel = catchAsync(async (req, res, next) => {

    // 1- le cco_agent recoit l'appel 
    // 2- le cco_agent cherche le numéro des qu'il le trouve il cree une intervention 
    // 3- le systeme supprime l'appel directement
    // quand c'est un success l'agent_cco commence a faire le choix d'IA
    if (req.body.numTel.length != 10) {
        return next(new AppError("Veulliez vous vérifier le numero", 400));
    }

    const appel = await Appel.findOne({
        numTel: req.body.numTel,
    });
    if (appel) {
        res.status(200).json({
            status: "success",
            appel
        });

    } else
        return next(new AppError("Ce numéro n'utilise pas l'application", 404));
});