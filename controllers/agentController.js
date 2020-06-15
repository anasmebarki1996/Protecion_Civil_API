const Agent = require("../models/agentModel");
const Unite = require("../models/uniteModel");
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const _ = require('lodash');
const {
    findOne
} = require("../models/agentModel");

const {
    Types: {
        ObjectId
    },
} = (mongoose = require("mongoose"));

exports.getAgent = catchAsync(async (req, res, next) => {
    if (req.unite.type == "principale") req.unite.query_unite['$in'].push(ObjectId(req.unite._id))
    var agent;

    if (req.body.id_agent) {
        agent = await Agent.findOne({
            id_unite: req.unite.query_unite,
            _id: ObjectId(req.body.id_agent)
        });
    } else if (req.params.id) {
        //this modification is for the android use
        agent = await Agent.findOne({
            id_unite: req.unite.query_unite,
            _id: req.params.id
        });
    }

    if (!agent) {
        return next(
            new AppError("Agent n'existe pas", 403)
        )
    }
    res.status(200).json({
        status: "success",
        id_unite: agent.id_unite,
        agent_id: agent._id,
        agent_nom: agent.nom,
        agent_prenom: agent.prenom,
        agent_date_de_naissance: agent.date_de_naissance,
        agent_role: agent.role,
        agent_numTel: agent.numTel,
        agent_username: agent.username
    })
});

exports.getAllAgents = catchAsync(async (req, res, next) => {
    let agents = [];
    // if (req.unite.type == "secondaire") {
    //     agents = Agent.find({
    //         id_unite: req.unite.query_unite
    //     });
    // } else {
    //     let unites;
    //     let unite;
    //     // verifier si cette unité est permis pour cet agent
    //     // if (req.body.id_unite && req.body.id_unite != req.agent.id_unite) {
    //     //     unites = await Unite.findOne({
    //     //         unite_principale: ObjectId(req.unite._id),
    //     //         _id: ObjectId(req.body.id_unite)
    //     //     }, {
    //     //         _id: 1,
    //     //     });
    //     //     if (!unites) {
    //     //         return next(
    //     //             new AppError("Vous n'avez pas la permission", 403)
    //     //         )
    //     //     }
    //     // }
    //     // else {
    //     //     unites = await Unite.find({
    //     //         _id: ObjectId(req.agent.id_unite)
    //     //     }, {
    //     //         _id: 1,
    //     //     });
    //     // }
    //     // unite = unites.map((x) => ObjectId(x._id));
    //     // unite.push(ObjectId(req.unite._id))
    //     // }
    //     // else {
    //     //     unites = await Unite.find({
    //     //         unite_principale: ObjectId(req.unite._id),
    //     //     }, {
    //     //         _id: 1,
    //     //     });
    //     //     unite = unites.map((x) => ObjectId(x._id));
    //     //     unite.push(ObjectId(req.unite._id));
    //     // }
    //     req.unite.query_unite['$in'].push(ObjectId(req.unite._id))
    //     agents = Agent.find({
    //         id_unite: req.unite.query_unite
    //     });
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
    agents = Agent.find({
        id_unite: req.unite.query_unite,
    });

    console.log(req.unite.query_unite)
    if (req.agent.role != "admin") {
        agents.where({
            role: "agent"
        })
    }

    const agents_length = await Agent.countDocuments(agents.getQuery());

    const features = new APIFeatures(agents, req.query).search().paginate().sort();
    agents = await features.query;
    res.status(200).json({
        status: "success",
        agents,
        agents_total: agents_length
    })
});

exports.createAgent = catchAsync(async (req, res, next) => {
    if (req.unite.type == "principale" && req.body.id_unite) {
        console.log("#########################")
        const unite = await Unite.findOne({
            _id: ObjectId(req.body.id_unite),
            unite_principale: req.agent.id_unite
        });
        if (unite) {
            req.agent.id_unite = unite._id;
        }
    }
    await Agent.create({
        nom: req.body.nom,
        prenom: req.body.prenom,
        date_de_naissance: req.body.date_de_naissance,
        numTel: req.body.numTel,
        username: req.body.username,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
        id_unite: req.agent.id_unite
    });

    res.status(200).json({
        status: "success",
    });
});

exports.updatePersonnelAgent = catchAsync(async (req, res, next) => {
    if (req.unite.type == "principale") req.unite.query_unite['$in'].push(ObjectId(req.unite._id));
    await Agent.findOneAndUpdate({
        _id: ObjectId(req.body.id_agent),
        id_unite: req.unite.query_unite
    }, {
        $set: {
            nom: req.body.nom,
            prenom: req.body.prenom,
            date_de_naissance: req.body.date_de_naissance,
            numTel: req.body.numTel,
        }
    })
    res.status(200).json({
        status: "success",
    });
});

exports.updateCompteAgent = catchAsync(async (req, res, next) => {
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
    await Agent.findOneAndUpdate({
        _id: ObjectId(req.body.id_agent),
        id_unite: req.unite.query_unite
    }, {
        $set: {
            role: req.body.role,
            username: req.body.username,
            id_unite: req.agent.id_unite
        }
    })

    res.status(200).json({
        status: "success",
    });
});

exports.updatePasswordAgent = catchAsync(async (req, res, next) => {
    await Agent.findOneAndUpdate({
        _id: ObjectId(req.body.id_agent),
        id_unite: req.agent.id_unite
    }, {
        $set: {
            password: req.body.password,
        }
    })
    res.status(200).json({
        status: "success",
    });
});

exports.searchAgent = catchAsync(async (req, res, next) => {
    const agents = await Agent.aggregate([{
            $match: {
                id_unite: req.agent.id_unite,
                role: "agent"
            }
        },
        {
            $project: {
                result: {
                    $concat: ["$nom", " ", "$prenom", " ---", "$username"]
                }
            }
        }
    ])
    res.status(200).json({
        status: "success",
        agents
    });
});

exports.deleteAgent = catchAsync(async (req, res, next) => {
    var agent;
    // if (req.unite.type == "secondaire") {
    //     agent = await Agent.findOneAndRemove({
    //         id_unite: req.agent.id_unite,
    //         _id: ObjectId(req.body.id_agent)
    //     });
    // } else {
    //     const unites = await Unite.find({
    //         unite_principale: ObjectId(req.unite._id),
    //     }, {
    //         _id: 1,
    //     });
    //     let unite = unites.map((x) => ObjectId(x._id));
    //     unite.push(ObjectId(req.unite._id));
    //     agent = await Agent.findOneAndRemove({
    //         id_unite: req.unite.query_unite,
    //         _id: ObjectId(req.body.id_agent)
    //     });
    // }
    if (req.unite.type == "principale") req.unite.query_unite['$in'].push(ObjectId(req.unite._id))
    agent = await Agent.findOneAndRemove({
        id_unite: req.unite.query_unite,
        _id: ObjectId(req.body.id_agent)
    });
    if (!agent) {
        return next(
            new AppError("Agent n'existe pas", 403)
        )
    }
    res.status(200).json()
});