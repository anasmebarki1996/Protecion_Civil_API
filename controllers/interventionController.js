const Intervention = require("./../models/interventionModel");
const catchAsync = require('../utils/catchAsync');

exports.getAllInterventions = catchAsync(async (req, res) => {
    const interventions = await Intervention.find();
    res.status(200).json({
        status: "success",
        data: {
            interventions
        }
    })
});

exports.createIntervention = catchAsync(async (req, res, next) => {
    const checkIntervention = await Intervention.findOne({
        agents: {
            $all: req.body.agents
        }
    });
    let intervention;
    if (!checkIntervention) {
        intervention = await Intervention.create({
            agents: req.body.agents,
            message: {
                body: req.body.message.body,
                sender: req.body.message.sender
            }
        });
    } else {
        intervention = await Intervention.findByIdAndUpdate(checkIntervention._id, {
            $push: {
                message: {
                    body: req.body.message.body,
                    sender: req.agent._id // req.agent passed from protected authController
                }
            }
        });
    }
    if (intervention) {
        res.status(200).json({
            status: "success"
        });
    } else {
        res.status(200).json({
            status: "error"
        });
    }

});