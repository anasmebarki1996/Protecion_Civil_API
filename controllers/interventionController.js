const Intervention = require("./../models/interventionModel");
const catchAsync = require('../utils/catchAsync');
const dateTime = require('../utils/moment').dateTime;

exports.getAllInterventions = catchAsync(async (req, res) => {
    const interventions = await Intervention.find();
    res.status(200).json({
        status: "success",
        data: {
            interventions
        }
    })
});

exports.updatedateTimeDepart = catchAsync(async (req, res) => {
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

