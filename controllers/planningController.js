const Planning = require("../models/planningModel");
const Agent = require("../models/agentModel");
const Engin = require("../models/enginModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const moment = require("./../utils/moment").moment;
const {
    Types: {
        ObjectId
    },
} = (mongoose = require("mongoose"));

exports.createPlanning = catchAsync(async (req, res, next) => {
    await Planning.create({
        id_unite: req.agent.id_unite,
        calendrier: [],
    });

    // console.log(query)
    res.status(200).json({
        status: "success",
    });
});

exports.addDate = catchAsync(async (req, res, next) => {
    await Planning.findOneAndUpdate({
            id_unite: req.agent.id_unite,
        }, {
            $push: {
                calendrier: {
                    date: req.body.date,
                },
            },
        }, {
            new: true,
        },
        (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
            }
            console.log(doc);
        }
    );
    // console.log(query)
    res.status(200).json({
        status: "success",
    });
});

exports.getTeams = catchAsync(async (req, res, next) => {

    console.log(req.body)
    const features = new APIFeatures(Planning.findOne({
        id_unite: req.agent.id_unite,
        "calendrier.date": req.body.date,
    }, {
        "_id": 0,
        "calendrier.$": 1
    }), req.query);
    const teams = await features.query;


    console.log(teams)
    res.status(200).json({
        status: "success",
        teams: teams.calendrier[0],
        teams_total: teams.length
    })
});


exports.addTeam = catchAsync(async (req, res, next) => {
    let agent;
    for (let i = 0; i < req.body.agents.length; i++) {
        agent = await Agent.findOne({
            username: req.body.agents[i].agent.split("---")[1],
        });
        if (
            agent && ["chauffeur", "chef", "secours"].includes(req.body.agents[i].type)
        ) {
            req.body.agents[i].agent = agent._id;
        } else {
            return next(
                new AppError("Veuilliez vous vérifier la liste des agents", 403)
            );
        }
    }

    let engin = await Engin.findOne({
        matricule: req.body.engin.split("---")[1],
    });

    if (!engin) {
        return next(
            new AppError("Veuilliez vous vérifier le matricule d'engin", 403)
        );
    }

    // verifier si la date entrée est une nouvelle date si oui on ajoute la nouvelle date 
    // sinon on ajoute directement a la date entrée qui est existe déja
    let dateVerify = await Planning.findOne({
        id_unite: req.agent.id_unite,
        "calendrier.date": req.body.date,
    });

    if (!dateVerify) {
        dateVerify = await Planning.findOneAndUpdate({
            id_unite: req.agent.id_unite,
        }, {
            $push: {
                calendrier: {
                    date: req.body.date,
                },
            },
        }, {
            new: true,
        });
    }
    let calendrier_id = dateVerify.calendrier.filter((x) =>
        moment(x.date).format('YYYY-MM-DD') === moment(req.body.date).format('YYYY-MM-DD')
    )[0]._id;

    await Planning.updateOne({
        id_unite: req.agent.id_unite,
        "calendrier.date": req.body.date,
    }, {
        $push: {
            "calendrier.$[a].team": {
                agents: req.body.agents, // list des agents
                engin: engin._id,
            },
        },
    }, {
        arrayFilters: [{
            "a._id": ObjectId(calendrier_id),
        }, ],
    });


    res.status(200).json({
        status: "success",
    });
});

exports.addAgent = catchAsync(async (req, res, next) => {
    await Planning.findOneAndUpdate({
            id_unite: req.body.id_unite,
            "calendrier.date": req.body.date,
        }, {
            $push: {
                "calendrier.$[a].team.$[b].agents": {
                    agents: req.body.agents, // list des agents
                    engin: req.body.engin,
                },
            },
        }, {
            new: true,
            arrayFilters: [{
                "a._id": ObjectId(req.body.calendrier_id),
                "b._id": ObjectId(req.body.team_id),
            }, ],
        },
        (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
            }
            console.log(doc);
        }
    );
    // console.log(query)
    res.status(200).json({
        status: "success",
    });
});