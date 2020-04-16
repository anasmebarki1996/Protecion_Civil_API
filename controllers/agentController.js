const Agent = require("../models/agentModel");
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures')

exports.getAllAgents = catchAsync(async (req, res) => {
    const features = new APIFeatures(Agent.find({
        id_unite: req.agent.id_unite
    }), req.query).search().paginate().sort();
    const agents = await features.query;

    console.log(agents)
    res.status(200).json({
        status: "success",
        agents,
        agents_total: agents.length
    })
});



exports.createAgent = catchAsync(async (req, res, next) => {
    const newAgent = await Agent.create({
        nom: req.body.nom,
        prenom: req.body.prenom,
        date_de_naissance: req.body.date_de_naissance,
        username: req.body.username,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
        numTel: req.body.numTel
    });

    res.status(200).json({
        status: "success",
        newAgent
    });
});


exports.searchAgent = catchAsync(async (req, res, next) => {

    console.log("#### il faut ajouter la contrainte type de l'agent");
    const agents = await Agent.aggregate(
        [{
                $match: {
                    id_unite: req.agent.id_unite,
                    // $or: [{
                    //     nom: {
                    //         $regex: req.body.input,
                    //         $options: 'i'
                    //     },
                    //     prenom: {
                    //         $regex: req.body.input,
                    //         $options: 'i'
                    //     },
                    //     username: {
                    //         $regex: req.body.input,
                    //         $options: 'i'
                    //     },
                    // }]
                }
            },
            {
                $project: {
                    result: {
                        $concat: ["$nom", " ", "$prenom", " ---", "$username"]
                    }
                }
            }
        ]
    )

    console.log(agents)



    res.status(200).json({
        status: "success",
        agents
    });
});