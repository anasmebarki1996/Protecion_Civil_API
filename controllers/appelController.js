const Appel = require("../models/appelModel");
const Intervention = require("../models/interventionModel");
const catchAsync = require('../utils/catchAsync');

exports.nouveauAppel = catchAsync(async (req, res) => {

    console.log(req.body)

    const appel = await Appel.create({
        numTel: req.body.numTel,
        gps_coordonnee: {
            latitude: req.body.gps_coordonnee.latitude,
            longitude: req.body.gps_coordonnee.longitude
        },
    });

    res.status(200).json({
        status: "success",
        appel
    });
});

exports.getAppel = catchAsync(async (req, res) => {

    // 1- le cco_agent recoit l'appel 
    // 2- le cco_agent cherche le numéro des qu'il le trouve il cree une intervention 
    // 3- le systeme supprime l'appel directement
    // quand c'est un success l'agent_cco commence a faire le choix d'IA

    const appel = await Appel.findOne({
        numTel: req.body.numTel,
    });
    if (appel) {

        await Intervention.create({
            numTel: appel.numTel,
            gps_coordonnee: {
                latitude: appel.gps_coordonnee.latitude,
                longitude: appel.gps_coordonnee.longitude
            },
            dateTimeAppel: appel.dateTimeAppel,
            cco_agent: req.agent._id
        });

        // sans await parce qu'on s'en fout des données supprimé
        Appel.deleteOne({
            numTel: appel.numTel
        });

        res.status(200).json({
            status: "success"
        });

    } else
        res.status(200).json({
            status: "error",
            message: "Numero inexistant , Veulliez introduire un nouveau numero"
        });

});

console.log("addDateTimeDepart à faire")

exports.addDateTimeDepart = catchAsync(async (req, res) => {


});