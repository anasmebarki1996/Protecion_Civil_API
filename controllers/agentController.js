const Agent = require("../models/agentModel");
const Unite = require("../models/uniteModel");
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const {
    Types: {
        ObjectId
    },
} = (mongoose = require("mongoose"));

exports.getAgent = catchAsync(async (req, res, next) => {
    const agent = await Agent.findOne({
        id_unite: req.agent.id_unite,
        _id: req.body.id_agent
    });

    if (!agent) {
        return next(
            new AppError("Agent n'existe pas", 403)
        )
    }
    res.status(200).json({
        status: "success",
        agent,
    })
});

exports.getAllAgents = catchAsync(async (req, res) => {
    let agents = []
    if (req.unite.type == "secondaire") {
        agents = Agent.find({
            id_unite: req.agent.id_unite,
            role: "agent"
        });
    } else {
        const unites = await Unite.find({
            unite_principale: ObjectId(req.unite._id),
        }, {
            _id: 1,
        });
        let unite = unites.map((x) => ObjectId(x._id));
        unite.push(ObjectId(req.unite._id));
        agents = Agent.find({
            id_unite: {
                $in: unite,
            },
            role: "agent"
        });
    }
    const features = new APIFeatures(agents, req.query).search().paginate().sort();
    agents = await features.query;
    res.status(200).json({
        status: "success",
        agents,
        agents_total: agents.length
    })
});



exports.createAgent = catchAsync(async (req, res, next) => {
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
    await Agent.findOneAndUpdate({
        _id: req.body.id_agent,
        id_unite: req.agent.id_unite
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
    await Agent.findOneAndUpdate({
        _id: req.body.id_agent,
        id_unite: req.agent.id_unite
    }, {
        $set: {
            role: req.body.role,
            username: req.body.username,
        }
    })
    res.status(200).json({
        status: "success",
    });
});

exports.updatePasswordAgent = catchAsync(async (req, res, next) => {
    await Agent.findOneAndUpdate({
        _id: req.body.id_agent,
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