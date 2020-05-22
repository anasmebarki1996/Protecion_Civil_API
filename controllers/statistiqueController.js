const Intervention = require("./../models/interventionModel");
const Unite = require("./../models/uniteModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const {
    Types: {
        ObjectId
    },
} = (mongoose = require("mongoose"));
exports.getInterventionJournalParIdNode = catchAsync(async (req, res, next) => {
    var date = new Date(req.body.date);
    if (!req.body.date || !(date instanceof Date) || isNaN(date.valueOf())) {
        return next(
            new AppError("Veuilliez vous verifier la date", 403)
        );
    }
    var start = new Date(req.body.date);
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    var end = new Date(req.body.date);
    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);
    let interventions = [];
    if (req.unite.type == "secondaire") {
        interventions = await Intervention.aggregate([{
                $match: {
                    id_unite: ObjectId(req.agent.id_unite),
                    dateTimeAppel: {
                        $gte: start,
                        $lte: end,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    node_id: 1,
                },
            },
            {
                $group: {
                    _id: {
                        node_id
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    node_id: "$_id.node_id",
                    count: 1,
                },
            },
        ]);
    } else {
        const unites = await Unite.find({
            unite_principale: ObjectId(req.unite._id),
        }, {
            _id: 1,
        });
        let unite = unites.map((x) => ObjectId(x._id));
        // ##################### max and min date #####################


        interventions = await Intervention.aggregate([{
                $match: {
                    id_unite: {
                        $in: unite,
                    },
                    dateTimeAppel: {
                        $gte: start,
                        $lte: end,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    node_id: 1,
                },
            },
            {
                $group: {
                    _id: {
                        node_id
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    node_id: "$_id.node_id",
                    count: 1,
                },
            },
        ]);
    }
    // SEND RESPONSE
    res.status(200).json({
        status: "success",
        interventions,
    });
});
exports.getInterventionParJourPendantUnMois = catchAsync(async (req, res, next) => {
    var date = new Date(req.body.date);
    if (!req.body.date || !(date instanceof Date) || isNaN(date.valueOf())) {
        return next(
            new AppError("Veuilliez vous verifier la date", 403)
        );
    }
    var start = new Date(req.body.date);
    start.setDate(1);
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    var end = new Date(req.body.date);
    end.setDate(31);
    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);
    let interventions = [];
    if (req.unite.type == "secondaire") {
        if (req.body.node_id && req.body.node_id != "") {
            interventions = await Intervention.aggregate([{
                    $match: {
                        id_unite: ObjectId(req.agent.id_unite),
                        dateTimeAppel: {
                            $gte: start,
                            $lte: end,
                        },
                        node_id: ObjectId(req.body.node_id),
                    },
                },
                {
                    $project: {
                        _id: 0,
                        datetimeappel: 1,
                        node_id: 1,
                    },
                },
                {
                    $group: {
                        _id: {
                            day: {
                                $dayOfMonth: "$dateTimeAppel"
                            },
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        day: "$_id.day",
                        count: 1,
                    },
                },
                {
                    $sort: {
                        day: 1,
                    },
                },
            ]);
        } else {
            interventions = await Intervention.aggregate([{
                    $match: {
                        id_unite: ObjectId(req.agent.id_unite),
                        dateTimeAppel: {
                            $gte: start,
                            $lte: end,
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        datetimeappel: 1,
                    },
                },
                {
                    $group: {
                        _id: {
                            day: {
                                $dayOfMonth: "$dateTimeAppel"
                            },
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        day: "$_id.day",
                        count: 1,
                    },
                },
                {
                    $sort: {
                        day: 1,
                    },
                },
            ]);
        }
    } else {
        const unites = await Unite.find({
            unite_principale: ObjectId(req.unite._id),
        }, {
            _id: 1,
        });
        let unite = unites.map((x) => ObjectId(x._id));
        // ##################### max and min date #####################

        if (req.body.node_id && req.body.node_id != "") {
            interventions = await Intervention.aggregate([{
                    $match: {
                        id_unite: {
                            $in: unite,
                        },
                        dateTimeAppel: {
                            $gte: start,
                            $lte: end,
                        },
                        node_id: ObjectId(req.body.node_id),
                    },
                },
                {
                    $project: {
                        _id: 0,
                        datetimeappel: 1,
                        node_id: 1,
                    },
                },
                {
                    $group: {
                        _id: {
                            day: {
                                $dayOfMonth: "$dateTimeAppel"
                            },
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        day: "$_id.day",
                        count: 1,
                    },
                },
                {
                    $sort: {
                        day: 1,
                    },
                },
            ]);
        } else {
            interventions = await Intervention.aggregate([{
                    $match: {
                        id_unite: {
                            $in: unite,
                        },
                        dateTimeAppel: {
                            $gte: start,
                            $lte: end,
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dateTimeAppel: 1,
                    },
                },
                {
                    $group: {
                        _id: {
                            day: {
                                $dayOfMonth: "$dateTimeAppel"
                            },
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        day: "$_id.day",
                        count: 1,
                    },
                },
                {
                    $sort: {
                        day: 1,
                    },
                },
            ]);
        }
    }
    // SEND RESPONSE
    res.status(200).json({
        status: "success",
        interventions,
    });
});
exports.getInterventionParMois = catchAsync(async (req, res, next) => {
    var date = new Date(req.body.date);
    if (!req.body.date || !(date instanceof Date) || isNaN(date.valueOf())) {
        return next(
            new AppError("Veuilliez vous verifier la date", 403)
        );
    }
    var start = new Date(req.body.date);
    start.setUTCMonth(0);
    start.setDate(1);
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    var end = new Date(req.body.date);
    end.setMonth(11);
    end.setDate(31);
    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);
    let interventions = [];
    if (req.unite.type == "secondaire") {
        if (req.body.node_id && req.body.node_id != "") {
            interventions = await Intervention.aggregate([{
                    $match: {
                        id_unite: ObjectId(req.agent.id_unite),
                        dateTimeAppel: {
                            $gte: start,
                            $lte: end,
                        },
                        node_id: ObjectId(req.body.node_id),
                    },
                },
                {
                    $group: {
                        _id: {
                            month: {
                                $month: "$dateTimeAppel",
                            },
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id.month",
                        count: 1,
                    },
                },
                {
                    $sort: {
                        month: 1,
                    },
                },
            ]);
        } else {
            interventions = await Intervention.aggregate([{
                    $match: {
                        id_unite: ObjectId(req.agent.id_unite),
                        dateTimeAppel: {
                            $gte: start,
                            $lte: end,
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            month: {
                                $month: "$dateTimeAppel",
                            },
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id.month",
                        count: 1,
                    },
                },
                {
                    $sort: {
                        month: 1,
                    },
                },
            ]);
        }
    } else {
        const unites = await Unite.find({
            unite_principale: ObjectId(req.unite._id),
        }, {
            _id: 1,
        });
        let unite = unites.map((x) => ObjectId(x._id));

        if (req.body.node_id && req.body.node_id != "") {
            interventions = await Intervention.aggregate([{
                    $match: {
                        id_unite: {
                            $in: unite,
                        },
                        dateTimeAppel: {
                            $gte: start,
                            $lte: end,
                        },
                        node_id: ObjectId(req.body.node_id),
                    },
                },
                {
                    $group: {
                        _id: {
                            month: {
                                $month: "$dateTimeAppel",
                            },
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id.month",
                        count: 1,
                    },
                },
                {
                    $sort: {
                        month: 1,
                    },
                },
            ]);
        } else {
            interventions = await Intervention.aggregate([{
                    $match: {
                        id_unite: {
                            $in: unite,
                        },
                        dateTimeAppel: {
                            $gte: start,
                            $lte: end,
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            month: {
                                $month: "$dateTimeAppel",
                            },
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id.month",
                        count: 1,
                    },
                },
                {
                    $sort: {
                        month: 1,
                    },
                },
            ]);
        }
    }
    // SEND RESPONSE
    res.status(200).json({
        status: "success",
        interventions,
    });
});