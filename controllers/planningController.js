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

exports.getPlanning = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
            Planning.aggregate([{
                    $unwind: "$calendrier",
                },
                {
                    $unwind: "$calendrier.team",
                },
                {
                    $match: {
                        id_unite: ObjectId(req.agent.id_unite),
                        "calendrier.date": new Date(req.body.date),
                    },
                },
                {
                    $project: {
                        _id: 0,
                        team: "$calendrier.team",
                    },
                },
                {
                    $unwind: "$team.agents",
                },
                {
                    $lookup: {
                        from: "agents",
                        let: {
                            agent: "$team.agents.agent",
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$agent"],
                                    },
                                },
                            },
                            {
                                $project: {
                                    nom: 1,
                                    prenom: 1,
                                    username: 1,
                                    numTel: 1,
                                },
                            },
                        ],
                        as: "team.schoolInfo",
                    },
                },
                {
                    $unwind: "$team.schoolInfo",
                },
                {
                    $project: {
                        team: {
                            _id: "$team._id",
                            idAgent: "$team.schoolInfo._id",
                            nom: "$team.schoolInfo.nom",
                            prenom: "$team.schoolInfo.prenom",
                            username: "$team.schoolInfo.username",
                            numTel: "$team.schoolInfo.numTel",
                            type: "$team.agents.type",
                            engin: "$team.engin",
                        },
                    },
                },
                {
                    $lookup: {
                        from: "engins",
                        let: {
                            engin: "$team.engin",
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
                                    matricule: 1,
                                    _id: 0,
                                },
                            },
                        ],
                        as: "team.engin",
                    },
                },
                {
                    $unwind: "$team.engin",
                },
                {
                    $group: {
                        _id: {
                            _id: "$team._id",
                            engin: "$team.engin",
                        },
                        agents: {
                            $push: {
                                idAgent: "$team.idAgent",
                                nom: "$team.nom",
                                prenom: "$team.prenom",
                                username: "$team.username",
                                numTel: "$team.numTel",
                                type: "$team.type",
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: "$_id._id",
                        engin: "$_id.engin",
                        agents: "$agents",
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ]),
            req.query
        )
        .paginate()
        .sort();

    const teams = await features.query;

    res.status(200).json({
        status: "success",
        teams: teams,
        teams_total: teams.length,
    });
});

exports.getTeam = catchAsync(async (req, res, next) => {
    const team = await Planning.aggregate([{
            $unwind: "$calendrier",
        },
        {
            $unwind: "$calendrier.team",
        },
        {
            $match: {
                id_unite: ObjectId(req.agent.id_unite),
                "calendrier.team._id": ObjectId(req.body.idTeam),
            },
        },
        {
            $project: {
                _id: 0,
                team: "$calendrier.team",
                "calendrier.date": 1,
            },
        },
        {
            $unwind: "$team.agents",
        },
        {
            $lookup: {
                from: "agents",
                let: {
                    agent: "$team.agents.agent",
                },
                pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$agent"],
                            },
                        },
                    },
                    {
                        $project: {
                            nom: 1,
                            prenom: 1,
                            username: 1,
                        },
                    },
                ],
                as: "team.schoolInfo",
            },
        },
        {
            $unwind: "$team.schoolInfo",
        },
        {
            $project: {
                team: {
                    _id: "$team._id",
                    idAgent: "$team.schoolInfo._id",
                    nom: "$team.schoolInfo.nom",
                    prenom: "$team.schoolInfo.prenom",
                    username: "$team.schoolInfo.username",
                    type: "$team.agents.type",
                    engin: "$team.engin",
                    date: "$calendrier.date",
                },
            },
        },
        {
            $lookup: {
                from: "engins",
                let: {
                    engin: "$team.engin",
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
                            matricule: 1,
                            _id: 0,
                        },
                    },
                ],
                as: "team.engin",
            },
        },
        {
            $unwind: "$team.engin",
        },
        {
            $group: {
                _id: {
                    _id: "$team._id",
                    engin: "$team.engin",
                    date: "$team.date",
                },
                agents: {
                    $push: {
                        idAgent: "$team.idAgent",
                        nom: "$team.nom",
                        prenom: "$team.prenom",
                        username: "$team.username",
                        type: "$team.type",
                    },
                },
            },
        },
        {
            $project: {
                _id: "$_id._id",
                engin: "$_id.engin",
                date: "$_id.date",
                agents: "$agents",
            },
        },
    ]);

    res.status(200).json({
        status: "success",
        team: team[0],
    });
});

exports.addTeam = catchAsync(async (req, res, next) => {

    // verification 
    for (let i = 0; i < req.body.agents.length; i++) {
        if (req.body.agents[i]) {
            return next(
                new AppError("Veuilliez vous vérifier la liste des agents", 403)
            );
        }
    }
    if (!req.body.engin) {
        return next(
            new AppError("Veuilliez vous introduire l'engin", 403)
        );
    }
    if (!req.body.date) {
        return next(
            new AppError("Veuilliez vous introduire la date", 403)
        );
    }

    // ################# 

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
    let calendrier_id = dateVerify.calendrier.filter(
        (x) =>
        moment(x.date).format("YYYY-MM-DD") ===
        moment(req.body.date).format("YYYY-MM-DD")
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

exports.deleteTeam = catchAsync(async (req, res, next) => {

    // verification 

    if (!req.body.idTeam) {
        return next(
            new AppError("Veuilliez vous acctualiser la page", 403)
        );
    }


    await Planning.findOneAndUpdate({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team._id": ObjectId(req.body.idTeam)
        }, {
            $pull: {
                "calendrier.$[].team": {
                    "_id": ObjectId(req.body.idTeam)
                }
            },
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Il y a un erreur veuillez acctualiser la page", 403)
                );
            }
        });

    res.status(200).json({
        status: "success",
    });
});


// ######################## Chauffeur ########################

exports.addChauffeur = catchAsync(async (req, res, next) => {
    // verification 

    if (!req.body.idTeam) {
        return next(
            new AppError("Veuilliez vous acctualiser la page", 403)
        );
    }
    if (!req.body.chauffeur) {
        return next(
            new AppError("Veuilliez vous verifier le chauffeur", 403)
        );
    }

    // ################# 
    await Planning.findOne({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team": {
                $elemMatch: {
                    _id: ObjectId(req.body.idTeam),
                    "agents.type": "chauffeur"
                }
            },
        },
        (err, doc) => {
            if (err) {
                return next(
                    new AppError("Veuilliez vous acctualiser la page", 403)
                );
            }
            if (doc) {
                return next(
                    new AppError("Le chauffeur existe déja", 403)
                );
            }
        });

    const agent = await Agent.findOne({
            username: req.body.chauffeur.split("---")[1],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Veuilliez vous vérifier la liste des agents", 403)
                );
            }
        });

    await Planning.findOneAndUpdate({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team._id": ObjectId(req.body.idTeam)
        }, {
            $addToSet: {
                "calendrier.$[].team.$[a].agents": {
                    "agent": agent._id,
                    "type": "chauffeur"
                }
            },
        }, {
            safe: true,
            upsert: true,
            arrayFilters: [{
                "a._id": ObjectId(req.body.idTeam),
            }, ],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Il y a un erreur veuillez acctualiser la page", 403)
                );
            }
        });


    res.status(200).json({
        status: "success",
    });
});

exports.deleteChauffeur = catchAsync(async (req, res, next) => {


    await Planning.findOneAndUpdate({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team._id": ObjectId(req.body.idTeam)
        }, {
            $pull: {
                "calendrier.$[].team.$[a].agents": {
                    "type": "chauffeur"
                }
            },
        }, {
            arrayFilters: [{
                "a._id": ObjectId(req.body.idTeam),
            }, ],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Il y a un erreur veuillez acctualiser la page", 403)
                );
            }
        });

    res.status(200).json({
        status: "success",
    });
});

// ######################## Chef ########################

exports.addChef = catchAsync(async (req, res, next) => {
    // verification 

    if (!req.body.idTeam) {
        return next(
            new AppError("Veuilliez vous acctualiser la page", 403)
        );
    }
    if (!req.body.chef) {
        return next(
            new AppError("Veuilliez vous verifier le chef d'agrés", 403)
        );
    }

    // #################
    await Planning.findOne({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team": {
                $elemMatch: {
                    _id: ObjectId(req.body.idTeam),
                    "agents.type": "chef"
                }
            },
        },
        (err, doc) => {
            if (err) {
                return next(
                    new AppError("Veuilliez vous vérifier la liste des agents", 403)
                );
            }
            if (doc) {
                return next(
                    new AppError("Le chef d'agres existe déja", 403)
                );
            }
        });

    const agent = await Agent.findOne({
            username: req.body.chef.split("---")[1],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Veuilliez vous vérifier la liste des agents", 403)
                );
            }
        });

    await Planning.findOneAndUpdate({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team._id": ObjectId(req.body.idTeam)
        }, {
            $addToSet: {
                "calendrier.$[].team.$[a].agents": {
                    "agent": agent._id,
                    "type": "chef"
                }
            },
        }, {
            safe: true,
            upsert: true,
            arrayFilters: [{
                "a._id": ObjectId(req.body.idTeam),
            }, ],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Il y a un erreur veuillez acctualiser la page", 403)
                );
            }
        });
    res.status(200).json({
        status: "success",
    });
});

exports.deleteChef = catchAsync(async (req, res, next) => {

    await Planning.findOneAndUpdate({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team._id": ObjectId(req.body.idTeam)
        }, {
            $pull: {
                "calendrier.$[].team.$[a].agents": {
                    "type": "chef"
                }
            },
        }, {
            arrayFilters: [{
                "a._id": ObjectId(req.body.idTeam),
            }, ],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Il y a un erreur veuillez acctualiser la page", 403)
                );
            }
        });

    res.status(200).json({
        status: "success",
    });
});

// ######################## Engin ########################

exports.addEngin = catchAsync(async (req, res, next) => {
    // verification 

    if (!req.body.idTeam) {
        return next(
            new AppError("Veuilliez vous acctualiser la page", 403)
        );
    }
    if (!req.body.enign) {
        return next(
            new AppError("Veuilliez vous verifier l'engin'", 403)
        );
    }

    // #################
    await Planning.findOne({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team": {
                $elemMatch: {
                    _id: ObjectId(req.body.idTeam),
                    "engin": {
                        $exists: true,
                        $ne: null
                    }
                }
            },
        },
        (err, doc) => {
            if (doc) {
                console.log("aaaaaaaaaaaaaaaa")
                return next(
                    new AppError("L'engin' existe déja", 403)
                );
            }
        });

    const engin = await Engin.findOne({
            matricule: req.body.engin.split("---")[1],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Veuilliez vous vérifier la liste des engins", 403)
                );
            }
        });

    await Planning.findOneAndUpdate({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team._id": ObjectId(req.body.idTeam)
        }, {
            $set: {
                "calendrier.$[].team.$[a].engin": engin._id
            }
        }, {
            arrayFilters: [{
                "a._id": ObjectId(req.body.idTeam),
            }, ],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Il y a un erreur veuillez acctualiser la page", 403)
                );
            }
        });

    res.status(200).json({
        status: "success",
    });
});

exports.deleteEngin = catchAsync(async (req, res, next) => {

    await Planning.findOneAndUpdate({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team._id": ObjectId(req.body.idTeam)
        }, {
            $set: {
                "calendrier.$[].team.$[a].engin": undefined
            }
        }, {
            arrayFilters: [{
                "a._id": ObjectId(req.body.idTeam),
            }, ],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Il y a un erreur veuillez acctualiser la page", 403)
                );
            }
        });

    res.status(200).json({
        status: "success",
    });
});

// ######################## Secours ########################

exports.addSecours = catchAsync(async (req, res, next) => {
    // verification 

    if (!req.body.idTeam) {
        return next(
            new AppError("Veuilliez vous acctualiser la page", 403)
        );
    }
    if (!req.body.secours) {
        return next(
            new AppError("Veuilliez vous verifier le secours", 403)
        );
    }

    // #################
    const agent = await Agent.findOne({
            username: req.body.secours.split("---")[1],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Veuilliez vous vérifier la liste des agents", 403)
                );
            }
        });

    await Planning.findOne({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team": {
                $elemMatch: {
                    _id: ObjectId(req.body.idTeam),
                    "agents.type": "secours",
                    "agents.agent": agent._id,
                }
            },
        },
        (err, doc) => {
            if (err) {
                return next(
                    new AppError("Veuilliez vous vérifier la liste des agents", 403)
                );
            }
            if (doc) {
                return next(
                    new AppError("l'agent existe déja", 403)
                );
            }
        });



    await Planning.findOneAndUpdate({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team._id": ObjectId(req.body.idTeam)
        }, {
            $addToSet: {
                "calendrier.$[].team.$[a].agents": {
                    "agent": agent._id,
                    "type": "secours"
                }
            },
        }, {
            safe: true,
            upsert: true,
            arrayFilters: [{
                "a._id": ObjectId(req.body.idTeam),
            }, ],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Il y a un erreur veuillez acctualiser la page", 403)
                );
            }
        });
    res.status(200).json({
        status: "success",
    });
});


exports.deleteSecours = catchAsync(async (req, res, next) => {
    // verification 

    if (!req.body.idTeam) {
        return next(
            new AppError("Veuilliez vous acctualiser la page", 403)
        );
    }
    if (!req.body.secours) {
        return next(
            new AppError("Veuilliez vous verifier le secours", 403)
        );
    }

    // #################
    const agent = await Agent.findOne({
            username: req.body.secours.split("---")[1],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Veuilliez vous vérifier la liste des agents", 403)
                );
            }
        });

    await Planning.findOneAndUpdate({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team._id": ObjectId(req.body.idTeam)
        }, {
            $pull: {
                "calendrier.$[].team.$[a].agents": {
                    "type": "secours",
                    "agent": agent._id,
                }
            },
        }, {
            arrayFilters: [{
                "a._id": ObjectId(req.body.idTeam),
            }, ],
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Il y a un erreur veuillez acctualiser la page", 403)
                );
            }
        });

    res.status(200).json({
        status: "success",
    });
});


exports.updateDate = catchAsync(async (req, res, next) => {
    // verification 
    if (!req.body.idTeam) {
        return next(
            new AppError("Veuilliez vous acctualiser la page", 403)
        );
    }
    if (!req.body.date || !moment(req.body.date).isValid()) {
        return next(
            new AppError("Veuilliez vous introduire la date", 403)
        );
    }
    // #################

    const team = await Planning.aggregate([{
            $unwind: "$calendrier",
        },
        {
            $unwind: "$calendrier.team",
        },
        {
            $match: {
                id_unite: ObjectId(req.agent.id_unite),
                "calendrier.team._id": ObjectId(req.body.idTeam),
            },
        },
        {
            $project: {
                _id: 0,
                team: "$calendrier.team",
                "calendrier.date": 1,
            },
        },
        {
            $unwind: "$team.agents",
        },

        {
            $project: {
                team: {
                    agent: "$team.agents.agent",
                    type: "$team.agents.type",
                    engin: "$team.engin",
                },
            },
        },
        {
            $group: {
                _id: {
                    engin: "$team.engin",
                },
                agents: {
                    $push: {
                        agent: "$team.agent",
                        type: "$team.type",
                    },
                },
            },
        },
        {
            $project: {
                engin: "$_id.engin",
                agents: "$agents",
            },
        },
    ]);


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
    let calendrier_id = dateVerify.calendrier.filter(
        (x) =>
        moment(x.date).format("YYYY-MM-DD") ===
        moment(req.body.date).format("YYYY-MM-DD")
    )[0]._id;

    await Planning.updateOne({
        id_unite: req.agent.id_unite,
        "calendrier.date": req.body.date,
    }, {
        $push: {
            "calendrier.$[a].team": {
                agents: team[0].agents, // list des agents
                engin: team[0].engin,
            },
        },
    }, {
        arrayFilters: [{
            "a._id": ObjectId(calendrier_id),
        }, ],
    });

    await Planning.findOneAndUpdate({
            id_unite: ObjectId(req.agent.id_unite),
            "calendrier.team._id": ObjectId(req.body.idTeam)
        }, {
            $pull: {
                "calendrier.$[].team": {
                    "_id": ObjectId(req.body.idTeam)
                }
            },
        },
        (err, doc) => {
            if (err || !doc) {
                return next(
                    new AppError("Il y a un erreur veuillez acctualiser la page", 403)
                );
            }
        });


    res.status(200).json({
        status: "success",
        team: team[0]
    });
});