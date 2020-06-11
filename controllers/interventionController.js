const Intervention = require("./../models/interventionModel");
const Planning = require("./../models/planningModel");
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
    return next(new AppError("Veuillez-vous verifier la date", 403));
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

  interventions = Intervention.find({
    dateTimeAppel: {
      $gte: start,
      $lte: end,
    },
  })

  // const unites = await Unite.find({
  //   unite_principale: ObjectId(req.unite._id),
  // }, {
  //   _id: 1
  // });
  // let unite = unites.map((x) => ObjectId(x._id));
  // if (req.unite.type == "secondaire") {
  //   interventions = interventions.where({
  //     id_unite: ObjectId(req.agent.id_unite),
  //   });
  // } else {
  //   interventions = interventions.where({
  //     $or: [
  //       {
  //         id_unite: {
  //           $in: unite
  //         },
  //       },
  //       {
  //         id_unite_principale: req.agent.id_unite
  //       }
  //     ]
  //   });
  // }

  interventions = interventions.where({
    $or: [{
        id_unite: req.unite.query_unite,
      },
      {
        id_unite_principale: req.agent.id_unite
      }
    ]
  });

  const interventions_length = await Intervention.countDocuments(interventions.getQuery());

  features = await new APIFeatures(
    interventions,
    req.query
  ).search().paginate().sort();

  interventions = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
    interventions_total: interventions_length
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
  let features, interventions = [],
    intervention;
  intervention = Intervention.find({
    id_unite: ObjectId(req.agent.id_unite),
    statut: "envoye"
  });
  const interventions_total = await Intervention.countDocuments(intervention.getQuery());

  features = new APIFeatures(intervention, req.query).search().paginate().sort();
  interventions = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
    interventions_total: interventions_total,
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

  // if (req.unite.type == "secondaire") {
  //   interventions.where({
  //     id_unite: ObjectId(req.agent.id_unite),
  //   })
  // } else {
  //   const unites = await Unite.find({
  //     unite_principale: ObjectId(req.unite._id),
  //   }, {
  //     _id: 1,
  //   });
  //   let unite = unites.map((x) => ObjectId(x._id));
  //   interventions = Intervention.where({
  //     id_unite: {
  //       $in: unite,
  //     },
  //   });
  // }

  interventions = interventions.where({
    $or: [{
        id_unite: req.unite.query_unite,
      },
      {
        id_unite_principale: req.agent.id_unite
      }
    ]
  });

  const interventions_total = await Intervention.countDocuments(interventions.getQuery());

  features = new APIFeatures(
    interventions,
    req.query
  ).search().paginate().sort();

  interventions = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
    interventions_total: interventions_total
  });
});

exports.envoyerIntervention = catchAsync(async (req, res, next) => {

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
    id_unite_principale: req.agent.id_unite,
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

exports.getIntervention_details = catchAsync(async (req, res, next) => {
  let intervention = await Intervention.aggregate([{
      $match: {
        _id: ObjectId(req.body.id_intervention),
      }
    },
    {
      $lookup: {
        from: "unites",
        let: {
          id_unite: "$id_unite",
        },
        pipeline: [{
          $match: {
            $expr: {
              $eq: ["$_id", "$$id_unite"],
            },
          },
        }, ],
        as: "unite_secondaire",
      },
    },
    {
      $unwind: "$unite_secondaire"
    },
    {
      $lookup: {
        from: "unites",
        let: {
          id_unite: "$id_unite_principale",
        },
        pipeline: [{
          $match: {
            $expr: {
              $eq: ["$_id", "$$id_unite"],
            },
          },
        }, ],
        as: "unite_principale",
      },
    },
    {
      $unwind: "$unite_principale"
    },
    {
      $lookup: {
        from: "agents",
        let: {
          id_agent: "$cco_agent_principale",
        },
        pipeline: [{
          $match: {
            $expr: {
              $eq: ["$_id", "$$id_agent"],
            },
          },
        }, {
          $project: {
            nom: 1,
            prenom: 1,
            _id: 0,
          },
        }],
        as: "cco_agent_principale",
      },
    },
    {
      $unwind: "$cco_agent_principale"
    },
    {
      $lookup: {
        from: "agents",
        let: {
          id_agent: "$cco_agent_secondaire",
        },
        pipeline: [{
          $match: {
            $expr: {
              $eq: ["$_id", "$$id_agent"],
            },
          },
        }, {
          $project: {
            nom: 1,
            prenom: 1,
            _id: 0,
          },
        }, ],
        as: "cco_agent_secondaire",
      },
    },
    {
      $unwind: "$cco_agent_secondaire"
    },
    {
      $lookup: {
        from: "hospitals",
        let: {
          id_hospital: "$transfere.hospital",
        },
        pipeline: [{
          $match: {
            $expr: {
              $eq: ["$_id", "$$id_hospital"],
            },
          },
        }],
        as: "transfere",
      },
    },
  ]);

  const team = await Planning.aggregate([{
      $unwind: "$calendrier",
    },
    {
      $unwind: "$calendrier.team",
    },
    {
      $match: {
        id_unite: ObjectId(req.agent.id_unite),
        "calendrier.team._id": ObjectId(intervention[0].id_team),
      },
    },
    {
      $project: {
        _id: 0,
        team: "$calendrier.team",
      },
    },
    {
      $unwind: "$team.agents",
    },
    {
      $lookup: {
        from: "agents",
        let: {
          agent: "$team.agents.agent",
        },
        pipeline: [{
            $match: {
              $expr: {
                $eq: ["$_id", "$$agent"],
              },
            },
          },
          {
            $project: {
              nom: 1,
              prenom: 1,
              username: 1,
            },
          },
        ],
        as: "team.schoolInfo",
      },
    },
    {
      $unwind: "$team.schoolInfo",
    },
    {
      $project: {
        team: {
          _id: "$team._id",
          id_agent: "$team.schoolInfo._id",
          nom: "$team.schoolInfo.nom",
          prenom: "$team.schoolInfo.prenom",
          type: "$team.agents.type",
          engin: "$team.engin",
        },
      },
    },
    {
      $lookup: {
        from: "engins",
        let: {
          engin: "$team.engin",
        },
        pipeline: [{
            $match: {
              $expr: {
                $eq: ["$_id", "$$engin"],
              },
            },
          },
          {
            $project: {
              code_name: 1,
              matricule: 1,
              _id: 0,
            },
          },
        ],
        as: "team.engin",
      },
    },
    {
      $unwind: "$team.engin",
    },
    {
      $group: {
        _id: {
          _id: "$team._id",
          engin: "$team.engin",
        },
        agents: {
          $push: {
            id_agent: "$team.id_agent",
            nom: "$team.nom",
            prenom: "$team.prenom",
            username: "$team.username",
            type: "$team.type",
          },
        },

      },
    },
    {
      $project: {
        _id: "$_id._id",
        engin: "$_id.engin",
        agents: "$agents",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    intervention: intervention[0],
    team: team[0]
  });
});

exports.getInterventionByChef = catchAsync(async (req, res, next) => {
  const id_team = req.params.id_team;
  const intervention = await Intervention.findOne({
    id_team: id_team,
    statut: {
      $nin: ["envoye", "annule", "termine"]
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


  console.log("transfer :" + req.body.transfere.hospital)

  await Intervention.findOneAndUpdate({
    _id: id_intervention

  }, req.body)

  const intervention = await Intervention.findOne({
    _id: id_intervention
  });

  if (!intervention) {
    return next(new AppError("intervention non disponible", 403));
  }

  io.emit("interventionStatusChange", id_intervention)

  res.status(200).json(intervention);
});

exports.test = catchAsync(async (req, res, next) => {

  io.emit("interventionStart", "5e99c95440c1d62ca8ee7906", "5ecdf0b56e77fd030ca168af")

  res.status(200).json({
    status: "success",

  });



})