const Intervention = require("./../models/interventionModel");
const catchAsync = require('../utils/catchAsync');
const dateTime = require('../utils/moment').dateTime;
const APIFeatures = require('../utils/apiFeatures')

exports.getAllInterventions = catchAsync(async (req, res) => {
    // // EXECUTE QUERY

    const features = new APIFeatures(Intervention.find({
        id_unite: req.agent.id_unite
    }), req.query).search().paginate().sort();
    const interventions = await features.query;

    // SEND RESPONSE
    res.status(200).json({
        status: "success",
        interventions,
        interventions_total: interventions.length
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