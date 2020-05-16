const Intervention = require("./../models/interventionModel");
const Appel = require("./../models/appelModel");
const Unite = require("./../models/uniteModel");
const catchAsync = require('../utils/catchAsync');
const dateTime = require('../utils/moment').dateTime;
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const {
    Types: {
        ObjectId
    },
} = (mongoose = require("mongoose"));

exports.getAllInterventions = catchAsync(async (req, res) => {
    // EXECUTE QUERY
    let features, interventions;
    if (req.unite.type == "secondaire") {
        features = new APIFeatures(Intervention.find({
            id_unite: ObjectId(req.agent.id_unite)
        }), req.query)
        interventions = await features.query;
    } else {
        console.log("####### getAllIntervention a un probleme pour l'unite principale")
        const unites = await Unite.find({
            unite_principale: ObjectId(req.unite._id)
        });
        let inter = [];
        let int;
        for (let i = 0; i < unites.length; i++) {
            int = Intervention.find({
                id_unite: req.agent.id_unite
            });
            features = new APIFeatures(int, req.query).search().paginate().sort();
            inter = await features.query;
            interventions.concat(inter);
        }
    }
    // SEND RESPONSE
    res.status(200).json({
        status: "success",
        interventions,
        interventions_total: interventions.length
    })
});


exports.getIntervention = catchAsync(async (req, res, next) => {
    // console.log(req.agent);
    // console.log(req.unite);
    // EXECUTE QUERY
    let intervention;
    if (req.unite.type == "secondaire") {
        intervention = await Intervention.findOne({
            _id: req.body.id_intervention,
        });
        if (!intervention) {
            return next(
                new AppError("cette intervention n'existe pas", 404)
            )
        }
        
        if (!intervention.id_unite.equals(req.agent.id_unite)) {
            return next(
                new AppError("Vous n'avez pas la permission pour cette intervention", 403)
            )
        }
    } else {
        intervention = await Intervention.findOne({
            _id: req.body.id_intervention,
        });
        if (!intervention) {
            return next(
                new AppError("cette intervention n'existe pas", 404)
            )
        } else {
            const unites = await Unite.findOne({
                _id: ObjectId(intervention.id_unite),
                unite_principale: ObjectId(req.unite.id_unite),
            });
            if (!unites) {
                return next(
                    new AppError("Vous n'avez pas la permission pour cette intervention", 403)
                )
            }
        }

    }
    // SEND RESPONSE
    res.status(200).json({
        status: "success",
        intervention
    })
});


exports.addDateTimeDepart = catchAsync(async (req, res) => {
    Intervention.updateOne({
        "chef": req.user._id
    }, {
        $set: {
            dateTimeDepart: dateTime
        }
    });
    res.status(200).json({
        status: "success"
    });
});


exports.envoyerIntervention = catchAsync(async (req, res, next) => {
    console.log("envoyerIntervention : manque id_node + description")

    await Intervention.create({
        numTel: req.body.numTel,
        adresse: {
            wilaya: req.body.wilaya,
            daira: req.body.daira,
            adresse_rue: req.body.adresse_rue,
            gps_coordonnee: {
                lat: req.body.gps_coordonnee.lat,
                lng: req.body.gps_coordonnee.lng
            }
        },
        cco_agent: req.agent._id,
        id_unite: req.agent.id_unite,
        id_node: req.body.id_node,
        dateTimeAppel: dateTime,
        statut: "envoye"
    });

    // sans await parce qu'on s'en fout des données supprimé
    // Appel.deleteOne({
    //     numTel: appel.numTel
    // });

    res.status(200).json({
        status: "success"
    });
});