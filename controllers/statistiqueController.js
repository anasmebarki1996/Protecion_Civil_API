const Intervention = require("./../models/interventionModel");
const Agent = require("./../models/agentModel");
const Unite = require("./../models/uniteModel");
const Engin = require("./../models/enginModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const today = require('./../utils/moment').date;
const moment = require('./../utils/moment').moment;
const {
  Types: {
    ObjectId
  },
} = (mongoose = require("mongoose"));

exports.getInterventionStatistiques = catchAsync(async (req, res, next) => {
  // étape pour  vérifier  le choix
  if (
    !req.body.choix ||
    !["quotidien", "mensuel", "annuel"].includes(req.body.choix)
  ) {
    return next(new AppError("Veuillez-vous introduire le choix", 403));
  }
  // étape pour  vérifier  le data
  var date = new Date(req.body.date);
  if (!req.body.date || !(date instanceof Date) || isNaN(date.valueOf())) {
    return next(new AppError("Veuillez-vous verifier la date", 403));
  }
  // étape pour faire la durée
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

  // étape pour chercher les interventions de cette durée
  let interventions = [];
  interventions = Intervention.aggregate([{
    $match: {
      dateTimeAppel: {
        $gte: start,
        $lte: end,
      },
    },
  }, ]);

  // étape pour filtrer les interventions de l'unité 
  // si l'unité est secondaire nous filtrons que ses interventions
  // sinon nous filtrons tous les interventions de ses unites secondaires
  if (req.unite.type == "secondaire") {
    interventions = interventions.match({
      id_unite: ObjectId(req.agent.id_unite),
    });
  } else {
    const unites = await Unite.find({
      unite_principale: ObjectId(req.unite._id),
    }, {
      _id: 1,
    });
    let unite = unites.map((x) => ObjectId(x._id));
    interventions = interventions.match({
      id_unite: {
        $in: unite,
      },
    });
  }

  // si le filter de l'intervention est activé nous filterons que le node demandé
  if (req.body.id_node && req.body.id_node != "") {
    interventions = interventions.match({
      id_node: ObjectId(req.body.id_node),
    });
  }
  // filter de choix quotidien , annuel ou mensuel 
  if (req.body.choix == "annuel") {
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
    interventions,
  });
});

exports.getInterventionHeatMap = catchAsync(async (req, res, next) => {
  if (
    !req.body.choix ||
    !["quotidien", "mensuel", "annuel"].includes(req.body.choix)
  ) {
    return next(new AppError("Veuillez-vous introduire le choix", 403));
  }
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
  if (req.body.choix == "mensuel") {
    start.setDate(1);
    end.setDate(31);
  } else if (req.body.choix == "annuel") {
    start.setUTCMonth(0);
    end.setMonth(11);
  }
  let interventions = [];
  interventions = Intervention.aggregate([{
    $match: {
      dateTimeAppel: {
        $gte: start,
        $lte: end,
      },
    },
  }, ]);
  if (req.unite.type == "secondaire") {
    interventions = interventions.match({
      id_unite: ObjectId(req.agent.id_unite),
    });
  } else {
    const unites = await Unite.find({
      unite_principale: ObjectId(req.unite._id),
    }, {
      _id: 1,
    });
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

exports.getUnitesQuiALePlusDinterventionParMois = catchAsync(async (req, res, next) => {
  if (req.unite.type == "secondaire") {
    return next(new AppError("Vous n'avez pas la permission", 403));
  }
  var date = new Date(today);
  if (!req.body.date || !(date instanceof Date) || isNaN(date.valueOf())) {
    return next(new AppError("Veuillez-vous verifier la date", 403));
  }
  var start = new Date(req.body.date);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  start.setDate(1);

  var end = new Date(req.body.date);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  end.setDate(31);
  let interventions = [];
  interventions = Intervention.aggregate([{
    $match: {
      dateTimeAppel: {
        $gte: start,
        $lte: end,
      },
    },
  }, ]);

  const unites = await Unite.find({
    unite_principale: ObjectId(req.unite._id),
  }, {
    _id: 1,
  });

  let unite = unites.map((x) => ObjectId(x._id));
  interventions = interventions.match({
    id_unite: {
      $in: unite,
    },
  });

  interventions = interventions.project({
      id_unite: 1
    }).group({
      _id: "$id_unite",
      count: {
        $sum: 1,
      },
    })
    .lookup({
      from: "unites",
      let: {
        id_unite: "$_id",
      },
      pipeline: [{
          $match: {
            $expr: {
              $eq: ["$_id", "$$id_unite"],
            },
          },
        },
        {
          $project: {
            nom: 1,
            _id: 0,
          },
        },
      ],
      as: "unite",
    }).unwind("unite").project({
      id_unite: "$_id",
      _id: 0,
      nom: "$unite.nom"

    })

  interventions = await interventions.exec();
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
  });
});

exports.getMeilleureTempsDeReposnseParMois = catchAsync(async (req, res, next) => {
  if (req.unite.type == "secondaire") {
    return next(new AppError("Vous n'avez pas la permission", 403));
  }
  var date = new Date(today);
  if (!req.body.date || !(date instanceof Date) || isNaN(date.valueOf())) {
    return next(new AppError("Veuillez-vous verifier la date", 403));
  }
  var start = new Date(req.body.date);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  start.setDate(1);

  var end = new Date(req.body.date);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  end.setDate(31);
  let interventions = [];
  interventions = Intervention.aggregate([{
    $match: {
      dateTimeAppel: {
        $gte: start,
        $lte: end,
      },
      statut: "termine"
    },
  }, ]);

  const unites = await Unite.find({
    unite_principale: ObjectId(req.unite._id),
  }, {
    _id: 1,
  });

  let unite = unites.map((x) => ObjectId(x._id));
  interventions = interventions.match({
    id_unite: {
      $in: unite,
    },
  });

  // interventions = interventions.project({
  //     id_unite: 1
  //   }).group({
  //     _id: "$id_unite",
  //     count: {
  //       $sum: 1,
  //     },
  //   })
  //   .lookup({
  //     from: "unites",
  //     let: {
  //       id_unite: "$_id",
  //     },
  //     pipeline: [{
  //         $match: {
  //           $expr: {
  //             $eq: ["$_id", "$$id_unite"],
  //           },
  //         },
  //       },
  //       {
  //         $project: {
  //           nom: 1,
  //           _id: 0,
  //         },
  //       },
  //     ],
  //     as: "unite",
  //   }).unwind("unite").project({
  //     id_unite: "$_id",
  //     _id: 0,
  //     nom: "$unite.nom"

  //   })

  interventions = await interventions.exec();
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
  });
});



exports.getStatistiques = catchAsync(async (req, res, next) => {
  if (req.unite.type == "secondaire") {
    return next(new AppError("Vous n'avez pas la permission", 403));
  }
  if (
    !req.body.choix ||
    !["quotidien", "mensuel", "annuel"].includes(req.body.choix)
  ) {
    return next(new AppError("Veuillez-vous introduire le choix", 403));
  }
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
  if (req.body.choix == "mensuel") {
    start.setDate(1);
    end.setDate(31);
  } else if (req.body.choix == "annuel") {
    start.setUTCMonth(0);
    end.setMonth(11);
    start.setDate(1);
    end.setDate(31);
  }
  const unites = await Unite.aggregate([{
    $match: {
      unite_principale: ObjectId(req.unite._id),
    },
  }, {
    $project: {
      id_unite: "$_id",
      _id: 0,
      nom: 1
    }
  }, ]);
  let unite = unites.map((x) => ObjectId(x.id_unite));
  let nombreAgents = await Agent.aggregate([{
      $match: {
        id_unite: {
          $in: unite,
        },
      },
    },
    {
      $group: {
        _id: "$id_unite",
        count: {
          $sum: 1,
        },
      }
    },
  ]).project({
    id_unite: "$_id",
    _id: 0,
    count: 1
  });

  let nombreEngins = await Engin.aggregate([{
    $match: {
      id_unite: {
        $in: unite,
      },
    },
  }, {
    $group: {
      _id: "$id_unite",
      count: {
        $sum: 1,
      },
    }
  }, ]).project({
    id_unite: "$_id",
    _id: 0,
    count: 1
  });;



  let interventions = [];
  let nombreInterventions = await Intervention.aggregate([{
    $match: {
      dateTimeAppel: {
        $gte: start,
        $lte: end,
      },
      id_unite: {
        $in: unite,
      },
    },

  }, ]).project({
    id_unite: 1
  }).group({
    _id: "$id_unite",
    count: {
      $sum: 1,
    },
  }).project({
    id_unite: "$_id",
    _id: 0,
    count: 1
  });

  let tempsReponse = await Intervention.aggregate([{
      $match: {
        dateTimeAppel: {
          $gte: start,
          $lte: end,
        },
        id_unite: {
          $in: unite,
        },
        statut: "termine"
      },

    }, {
      $project: {
        dateTimeAppel: 1,
        dateTimeDepart: 1,
        id_unite: 1,
        _id: 0
      }
    }, {
      $group: {
        _id: "$id_unite",
        moy: {
          $avg: {
            $subtract: ["$dateTimeDepart", "$dateTimeAppel"]
          }
        },
      },
    },
    {
      $project: {
        id_unite: "$_id",
        _id: 0,
        moy: 1

      }
    }
  ]);

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    unites,
    nombreAgents,
    nombreEngins,
    nombreInterventions,
    tempsReponse
  });
});