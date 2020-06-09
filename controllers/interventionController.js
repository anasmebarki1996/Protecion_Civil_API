const Intervention = require("./../models/interventionModel");
const Appel = require("./../models/appelModel");
const Unite = require("./../models/uniteModel");
const catchAsync = require("../utils/catchAsync");
const dateTime = require("../utils/moment").dateTime;
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const io = require("../socket").io
const {
  Types: {
    ObjectId
  },
} = (mongoose = require("mongoose"));

exports.getAllIntervention = catchAsync(async (req, res, next) => {

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
  // EXECUTE QUERY
  let features, interventions = [];
  const unites = await Unite.find({
    unite_principale: ObjectId(req.unite._id),
  }, {
    _id: 1
  });
  let unite = unites.map((x) => ObjectId(x._id));
  interventions = Intervention.find({
    dateTimeAppel: {
      $gte: start,
      $lte: end,
    },
  })
  if (req.unite.type == "secondaire") {
    interventions = interventions.where({
      id_unite: ObjectId(req.agent.id_unite),
    });
  } else {
    interventions = interventions.where({
      id_unite: {
        $in: unite
      },
    });
  }
  features = await new APIFeatures(
    interventions,
    req.query
  ).search().paginate().sort();

  interventions = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
    interventions_total: interventions.length,
  });
});



exports.getAllIntervention_name = catchAsync(async (req, res) => {
  // EXECUTE QUERY

  const interventions = await Intervention.aggregate([{
      $project: {
        _id: 0,
        id_node: 1
      }
    },
    {
      $group: {
        _id: "$id_node",
      }
    },
    {
      $project: {
        _id: 0,
        id_node: "$_id"
      }
    }, {
      $lookup: {
        from: "nodes",
        let: {
          id_node: "$id_node",
        },
        pipeline: [{
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
      },
    }, {
      $unwind: "$team"
    },
    {
      $project: {
        id_node: 1,
        name: "$team.name"
      }
    },
  ]);

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
  });
});
exports.getIntervention = catchAsync(async (req, res, next) => {
  let intervention = await Intervention.findOne({
    _id: req.body.id_intervention,
  });
  if (!intervention) {
    return next(new AppError("cette intervention n'existe pas", 404));
  } else {
    if (req.unite.type == "secondaire") {
      if (!intervention.id_unite.equals(req.agent.id_unite)) {
        return next(
          new AppError(
            "Vous n'avez pas la permission pour cette intervention",
            403
          )
        );
      }
    } else {
      const unites = await Unite.findOne({
        _id: ObjectId(intervention.id_unite),
        unite_principale: ObjectId(req.unite._id),
      });
      if (!unites) {
        return next(
          new AppError(
            "Vous n'avez pas la permission pour cette intervention",
            403
          )
        );
      }
    }
  }
  res.status(200).json({
    status: "success",
    intervention,
  });
});

exports.addDateTimeDepart = catchAsync(async (req, res) => {
  Intervention.updateOne({
    chef: req.user._id,
  }, {
    $set: {
      dateTimeDepart: dateTime,
    },
  });
  res.status(200).json({
    status: "success",
  });
});



exports.getAllIntervention_Envoye = catchAsync(async (req, res) => {
  // EXECUTE QUERY
  let features, interventions = [];
  features = new APIFeatures(
    Intervention.find({
      id_unite: ObjectId(req.agent.id_unite),
      statut: "envoye"
    }),
    req.query
  ).search().paginate().sort();
  interventions = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
    interventions_total: interventions.length,
  });
});

exports.getAllIntervention_EnCours = catchAsync(async (req, res) => {
  // EXECUTE QUERY
  let features, interventions = [];
  var start = new Date(dateTime);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  var end = new Date(dateTime);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);

  interventions = Intervention.find({
    dateTimeAppel: {
      $gte: start,
      $lte: end,
    },
    statut: {
      "$in": ["recu", "depart", "en_cours", "transfere"]
    }
  })

  if (req.unite.type == "secondaire") {
    interventions.where({
      id_unite: ObjectId(req.agent.id_unite),
    })
  } else {
    const unites = await Unite.find({
      unite_principale: ObjectId(req.unite._id),
    }, {
      _id: 1,
    });
    let unite = unites.map((x) => ObjectId(x._id));
    interventions = intervention.where({
      id_unite: {
        $in: unite,
      },
    });
  }

  features = new APIFeatures(
    interventions,
    req.query
  ).search().paginate().sort();

  interventions = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
    interventions_total: interventions.length,
  });
});


exports.envoyerIntervention = catchAsync(async (req, res, next) => {
  console.log("envoyerIntervention : manque id_node + description");

  await Intervention.create({
    numTel: req.body.numTel,
    adresse: {
      wilaya: req.body.wilaya,
      daira: req.body.daira,
      adresse_rue: req.body.adresse_rue,
      gps_coordonnee: {
        lat: req.body.gps_coordonnee.lat,
        lng: req.body.gps_coordonnee.lng,
      },
    },
    cco_agent: req.agent._id,
    id_unite: req.agent.id_unite,
    id_node: req.body.id_node,
    dateTimeAppel: dateTime,
    statut: "envoye",
  });

  // sans await parce qu'on s'en fout des données supprimé
  // Appel.deleteOne({
  //     numTel: appel.numTel
  // });

  res.status(200).json({
    status: "success",
  });
});

exports.envoyerInterventionAuChef = catchAsync(async (req, res, next) => {
  const intervention = await Intervention.findOne({
    _id: req.body.id_intervention,
    statut: "envoye"
  })

  if (!intervention) {
    return next(new AppError("intervention non disponible, vous devez acctualiser la page", 403));
  }

  await Intervention.findOneAndUpdate({
    _id: req.body.id_intervention,
  }, {
    $set: {
      cco_agent_secondaire: req.agent._id,
      id_unite: req.agent.id_unite,
      id_team: req.body.id_team,
      statut: "recu",
    }
  });

  io.emit("interventionStart", req.body.id_team, req.body.id_intervention)
  

  res.status(200).json({
    status: "success",
    intervention
  });
});



exports.getInterventionByChef = catchAsync(async (req, res, next) => {
  const id_team = req.params.id_team;
  const intervention = await Intervention.findOne({
    id_team: id_team,
    statut: {
      $nin: ["envoye","annule","termine"]
    }
  })

  if (!intervention) {
    return next(new AppError("intervention non disponible", 403));
  }





  res.status(200).json(intervention);
});


exports.updateInterventionStatus = catchAsync(async (req, res, next) => {


  const id_intervention = req.params.id_intervention;



  await Intervention.findOneAndUpdate({
    _id: id_intervention
  }, {
    statut: req.body.statut
  })

  const intervention = await Intervention.findOne({
    _id: id_intervention
  });


  if (!intervention) {
    return next(new AppError("intervention non disponible", 403));
  }


  res.status(200).json(intervention);



})


exports.updateInterventionByChef = catchAsync(async (req, res, next) => {
  const id_intervention = req.params.id_intervention;

  if (req.body.dateTimeDepart == "now()")
    req.body.dateTimeDepart = dateTime

  if (req.body.dateTimeArrive == "now()")
    req.body.dateTimeArrive = dateTime

  if (req.body.transfere.dateTimeDepart == "now()")
    req.body.transfere.dateTimeDepart = dateTime

  if (req.body.dateTimeFin == "now()")
    req.body.dateTimeFin = dateTime


    console.log("transfer :"+req.body)

    

  await Intervention.findOneAndUpdate({
    _id: id_intervention

  }, req.body)

  const intervention = await Intervention.findOne({
    _id: id_intervention
  });

  if (!intervention) {
    return next(new AppError("intervention non disponible", 403));
  }

  io.emit("interventionStatusChange",  id_intervention)

  res.status(200).json(intervention);
});


exports.test = catchAsync(async (req, res, next) => {

  io.emit("interventionStart", "5e99c95440c1d62ca8ee7906", "5ecdf0b56e77fd030ca168af")

  res.status(200).json({
    status: "success",

  });



})