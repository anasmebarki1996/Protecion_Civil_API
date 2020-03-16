const Agent = require("../models/agentModel");
const catchAsync = require('../utils/catchAsync');

exports.getAllAgents = catchAsync(async (req, res) => {
    console.log("heloo")
    const agents = await Agent.find();
    res.status(200).json({
        status: "success",
        data: {
            agents
        }
    })
});