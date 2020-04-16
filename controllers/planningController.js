const Planning = require("../models/planningModel");
const catchAsync = require("../utils/catchAsync");
const appError = require("./../utils/appError");
const {
    Types: {
        ObjectId
    },
} = (mongoose = require("mongoose"));

exports.createPlanning = catchAsync(async (req, res, next) => {
    await Planning.create({
        id_unite: req.body.id_unite,
        calendrier: [],
    });

    // console.log(query)
    res.status(200).json({
        status: "success",
    });
});

exports.addDate = catchAsync(async (req, res, next) => {
    await Planning.findOneAndUpdate({
            id_unite: req.body.id_unite,
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

exports.addTeam = catchAsync(async (req, res, next) => {
    console.log(req.body)
    let agent;
    for (let i = 0; i < req.body.agents.length; i++) {
        agent = await Agent.find({
            username: req.body.agents[0].agent
        });
        if (agent && ["chaffeur", "chef", "secours"].includes(req.body.agents[i].type)) {
            req.body.agents[i].agent = agent._id;
        } else {
            return next(
                new AppError("Veuilliez vous vérifier la liste des agents", 403)
            )
        }
    }
    let engin = await Engin.find({
        matricule: req.body.engin
    });
    if (!engin) {
        return next(
            new AppError("Veuilliez vous vérifier le matricule d'engin", 403)
        )
    }
    const planning = await Planning.findOneAndUpdate({
            id_unite: req.agent.id_unite,
            calendrier: {
                date: req.body.date,
            },
        }, {
            $push: {
                "calendrier.$[a].team": {
                    agents: req.body.agents, // list des agents
                    engin: req.body.engin,
                },
            },
        }, {
            new: true,
            arrayFilters: [{
                "a._id": ObjectId(req.body.calendrier_id),
            }, ],
        },
        (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
            }
            console.log(doc);
        }
    );
    res.status(200).json({
        status: "success",
        planning
    });
});

exports.addAgent = catchAsync(async (req, res, next) => {
    await Planning.findOneAndUpdate({
            id_unite: req.body.id_unite,
            calendrier: {
                date: req.body.date,
            },
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

// exports.createPlanning = catchAsync(async (req, res, next) => {
//     let newPlanning;
//     // const newPlanning = await Planning.create({
//     //     id_unite: "req.body.id_unitee",
//     //     calendrier: [{
//     //         date: "2020-03-26",
//     //         team: [{
//     //             agents: [{
//     //                 agent: "5e7bae2b01b07d2118a6382e",
//     //                 type: "secours"
//     //             }],
//     //             engin: "5e8e2ca5294f4733d0ec71c4"
//     //         }]
//     //     }]
//     // });
//     // ################################################
//     // Planning.findOneAndUpdate({
//     //     id_unite: 'req.body.id_unitee',
//     // }, {
//     //     $push: {
//     //         calendrier: {
//     //             date: "2020-03-20"
//     //         }
//     //     }
//     // }, {
//     //     new: true
//     // }, (err, doc) => {
//     //     if (err) {
//     //         console.log("Something wrong when updating data!");
//     //     }

//     //     console.log(doc);
//     // });
//     // ################################################

//     // Planning.findOneAndUpdate({
//     //     id_unite: 'req.body.id_unitee',
//     //
//     // }, {
//     //     $push: {
//     //         calendrier: {
//     //             date: "2020-03-11"
//     //         }
//     //     }
//     // }, {
//     //     new: true
//     // }, (err, doc) => {
//     //     if (err) {
//     //         console.log("Something wrong when updating data!");
//     //     }

//     //     console.log(doc);
//     // });
//     // Simulating the date values

//     Planning.findOneAndUpdate({
//             calendrier: {
//                 $elemMatch: {
//                     date: "2020-03-26"
//                 }
//             }
//         }, {
//             $push: {
//                 "calendrier.0.team.$[a].agents": {
//                     agent: "5e7bae2b01b07d2118a6382e",
//                     type: "chef"
//                 }
//             }
//         }, {
//             new: true,
//             // But not in here
//             "arrayFilters": [{
//                 "a._id": ObjectId("5e90d55e81983813dc50cff1")
//             }]
//         },
//         (err, doc) => {
//             if (err) {
//                 console.log("Something wrong when updating data!");
//             }

//             console.log(doc);
//         });
//     // var query = await Planning.find({
//     //     calendrier: {
//     //         $elemMatch: {
//     //             date: "2020-03-26"
//     //         }
//     //     }
//     // });

//     // console.log(query)
//     res.status(200).json({
//         status: "success",
//     });
// });