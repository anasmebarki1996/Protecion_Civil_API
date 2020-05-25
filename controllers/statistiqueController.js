const Intervention = require("./../models/interventionModel");
const Unite = require("./../models/uniteModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const {
  Types: { ObjectId },
} = (mongoose = require("mongoose"));
exports.getInterventionStatistiques = catchAsync(async (req, res, next) => {
  if (
    !req.body.choix ||
    !["quotidien", "mensuel", "annuel"].includes(req.body.choix)
  ) {
    return next(new AppError("Veuilliez vous introduire le choix", 403));
  }
  var date = new Date(req.body.date);
  if (!req.body.date || !(date instanceof Date) || isNaN(date.valueOf())) {
    return next(new AppError("Veuilliez vous verifier la date", 403));
  }
  var start = new Date(req.body.date);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  var end = new Date(req.body.date);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  if (req.body.choix == "mensuel") {
    start.setDate(1);
    end.setDate(31);
  } else if (req.body.choix == "annuel") {
    start.setUTCMonth(0);
    end.setMonth(11);
    start.setDate(1);
    end.setDate(31);
  }
  let interventions = [];
  interventions = Intervention.aggregate([
    {
      $match: {
        dateTimeAppel: {
          $gte: start,
          $lte: end,
        },
      },
    },
  ]);
  if (req.unite.type == "secondaire") {
    interventions = interventions.match({
      id_unite: ObjectId(req.agent.id_unite),
    });
  } else {
    const unites = await Unite.find(
      {
        unite_principale: ObjectId(req.unite._id),
      },
      {
        _id: 1,
      }
    );
    let unite = unites.map((x) => ObjectId(x._id));
    interventions = interventions.match({
      id_unite: {
        $in: unite,
      },
    });
  }
  if (req.body.id_node && req.body.id_node != "") {
    interventions = interventions.match({
      id_node: ObjectId(req.body.id_node),
    });
  }
  if (req.body.choix == "annuel") {
    console.log(req.body.choix);

    interventions = interventions
      .group({
        _id: {
          month: {
            $month: "$dateTimeAppel",
          },
        },
        count: {
          $sum: 1,
        },
      })
      .project({
        filter: "$_id.month",
        _id: 0,
        count: 1,
      });
  } else if (req.body.choix == "mensuel") {
    interventions = interventions
      .group({
        _id: {
          day: {
            $dayOfMonth: "$dateTimeAppel",
          },
        },
        count: {
          $sum: 1,
        },
      })
      .project({
        filter: "$_id.day",
        _id: 0,
        count: 1,
      });
  } else {
    interventions = interventions
      .group({
        _id: "$id_node",
        count: {
          $sum: 1,
        },
      })
      .project({
        id_node: "$_id",
        _id: 0,
        count: 1,
      })
      .lookup({
        from: "nodes",
        let: {
          id_node: "$id_node",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id_node"],
              },
            },
          },
          {
            $project: {
              name: 1,
              _id: 0,
            },
          },
        ],
        as: "team",
      })
      .unwind("$team")
      .project({
        count: 1,
        filter: "$team.name",
      });
  }

  interventions = interventions.sort("filter");

  interventions = await interventions.exec();

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
  });
});

exports.getInterventionHeatMap = catchAsync(async (req, res, next) => {
  if (
    !req.body.choix ||
    !["quotidien", "mensuel", "annuel"].includes(req.body.choix)
  ) {
    return next(new AppError("Veuilliez vous introduire le choix", 403));
  }
  var date = new Date(req.body.date);
  if (!req.body.date || !(date instanceof Date) || isNaN(date.valueOf())) {
    return next(new AppError("Veuilliez vous verifier la date", 403));
  }
  var start = new Date(req.body.date);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  var end = new Date(req.body.date);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  if (req.body.choix == "mensuel") {
    start.setDate(1);
    end.setDate(31);
  } else if (req.body.choix == "annuel") {
    start.setUTCMonth(0);
    end.setMonth(11);
  }
  let interventions = [];
  interventions = Intervention.aggregate([
    {
      $match: {
        dateTimeAppel: {
          $gte: start,
          $lte: end,
        },
      },
    },
  ]);
  if (req.unite.type == "secondaire") {
    interventions = interventions.match({
      id_unite: ObjectId(req.agent.id_unite),
    });
  } else {
    const unites = await Unite.find(
      {
        unite_principale: ObjectId(req.unite._id),
      },
      {
        _id: 1,
      }
    );
    let unite = unites.map((x) => ObjectId(x._id));
    interventions = interventions.match({
      id_unite: {
        $in: unite,
      },
    });
  }
  if (req.body.id_node && req.body.id_node != "") {
    interventions = interventions.match({
      id_node: ObjectId(req.body.id_node),
    });
  }
  interventions = interventions.project({
    _id: 0,
    id_node: 1,
    gps_coordonnee: "$adresse.gps_coordonnee",
  });

  interventions = await interventions.exec();
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
  });
});
