const Planning = require("../models/planningModel");
const Agent = require("../models/agentModel");
const Engin = require("../models/enginModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const moment = require("../utils/moment").moment;
const dateTime = require("../utils/moment").dateTime;
const {
  Types: {
    ObjectId
  },
} = (mongoose = require("mongoose"));


exports.getTeam = catchAsync(async (req, res, next) => {
  const team = await Planning.aggregate([{
      $unwind: "$calendrier",
    },
    {
      $unwind: "$calendrier.team",
    },
    {
      $match: {
        id_unite: ObjectId(req.agent.id_unite),
        "calendrier.team._id": ObjectId(req.body.id_team),
      },
    },
    {
      $project: {
        _id: 0,
        team: "$calendrier.team",
        "calendrier.date": 1,
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
          username: "$team.schoolInfo.username",
          type: "$team.agents.type",
          engin: "$team.engin",
          date: "$calendrier.date",
          disponibilite: "$team.disponibilite",
          gps_coordonnee: "$team.gps_coordonnee",
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
          date: "$team.date",
          disponibilite: "$team.disponibilite",
          gps_coordonnee: "$team.gps_coordonnee",
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
        date: "$_id.date",
        disponibilite: "$_id.disponibilite",
        gps_coordonnee: "$_id.gps_coordonnee",
        agents: "$agents",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    team: team[0],
  });
});

exports.getAdresseAllTeams = catchAsync(async (req, res, next) => {
  const teams = await Planning.aggregate([{
      $unwind: "$calendrier",
    },
    {
      $unwind: "$calendrier.team",
    },
    {
      $match: {
        id_unite: ObjectId(req.agent.id_unite),
        "calendrier.date": new Date("2020-04-02"),
      },
    },
    {
      $project: {
        _id: 0,
        id_team: "$calendrier.team._id",
        disponibilite: "$calendrier.team.disponibilite",
        gps_coordonnee: "$calendrier.team.gps_coordonnee",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    teams,
  });
});

exports.getAdresseTeam = catchAsync(async (req, res, next) => {
  const team = await Planning.aggregate([{
      $unwind: "$calendrier",
    },
    {
      $unwind: "$calendrier.team",
    },
    {
      $match: {
        id_unite: ObjectId(req.agent.id_unite),
        "calendrier.date": new Date("2020-04-02"),
        "calendrier.team._id": ObjectId(req.body.id_team)
      },
    },
    {
      $project: {
        _id: 0,
        gps_coordonnee: "$calendrier.team.gps_coordonnee",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    team: team[0],
  });
});

exports.setAdresseTeam = catchAsync(async (req, res, next) => {

  const id_team = await getTeamId(req.agent);
  if(id_team == null){
    return next(
      new AppError("cet agent n'est affecté à aucune équipe", 403)
    );
  }
  const team = await Planning.findOneAndUpdate({
      id_unite: ObjectId(req.agent.id_unite),
      "calendrier.team._id": ObjectId(id_team),
    }, {
      $set: {
        "calendrier.$[].team.$[a].gps_coordonnee.lat": req.body.latitude,
        "calendrier.$[].team.$[a].gps_coordonnee.lng": req.body.longitude,
        "calendrier.$[].team.$[a].gps_coordonnee.lastUpdate": new Date(dateTime),
      },
    }, {
      arrayFilters: [{
        "a._id": ObjectId(id_team),
      }, ],
    },
    (err, doc) => {
      if (err || !doc) {
        return next(
          new AppError("Il y a un erreur veuillez acctualiser la page", 403)
        );
      }
    }
  );

  

  res.status(200).json({
    status: "success",
    team
  });
});

exports.getTeamID = catchAsync(async (req, res, next) => {
 
  const id = await getTeamId(req.agent);

  res.status(200).json({
    status: "success",
    id_team: id,
  });
});

// pour avoir la liste des equipes disponible pour leur envoyer les interventions
exports.getTeamsDisponible = catchAsync(async (req, res, next) => {
  const teams = await Planning.aggregate([{
      $unwind: "$calendrier",
    },
    {
      $unwind: "$calendrier.team",
    },
    {
      $match: {
        id_unite: ObjectId(req.agent.id_unite),
        "calendrier.date": new Date("2020-04-02"),
      },
    },
    {
      $unwind: "$calendrier.team.agents",
    },
    {
      $match: {
        "calendrier.team.agents.type": "chef"
      },
    },
    {
      $project: {
        _id: 0,
        id_team: "$calendrier.team._id",
        id_agent: "$calendrier.team.agents.agent",
        id_engin: "$calendrier.team.engin",
        disponibilite: "$calendrier.team.disponibilite",
        gps_coordonnee: "$calendrier.team.gps_coordonnee",
      },
    },
    {
      $lookup: {
        from: "agents",
        let: {
          id_agent: "$id_agent",
        },
        pipeline: [{
            $match: {
              $expr: {
                $eq: ["$_id", "$$id_agent"],
              },
            },
          },
          {
            $project: {
              nom: 1,
              prenom: 1,
              numTel: 1,
              _id: 1,
            },
          },
        ],
        as: "agent",
      },
    },
    {
      $lookup: {
        from: "engins",
        let: {
          id_engin: "$id_engin",
        },
        pipeline: [{
            $match: {
              $expr: {
                $eq: ["$_id", "$$id_engin"],
              },
            },
          },
          {
            $project: {
              code_name: 1,
              panne: 1,
              _id: 1,
            },
          },
        ],
        as: "engin",
      },
    },
    {
      $unwind: "$agent",
    },
    {
      $unwind: "$engin",
    },
    // {
    //   $project: {
    //     _id: 0,
    //     id_team: "$calendrier.team._id",
    //     disponibilite: "$calendrier.team.disponibilite",
    //     gps_coordonnee: "$calendrier.team.gps_coordonnee",
    //   },
    // },
  ]);

  res.status(200).json({
    status: "success",
    teams,
  });
});




var getTeamId = async function(agent){
  
  var start = new Date(dateTime);
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    var end = new Date(dateTime);
    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);
  const id_team = await Planning.aggregate([{
    $unwind: "$calendrier",
  },
  {
    $unwind: "$calendrier.team",
  },
  {
    $match: {
      id_unite: ObjectId(agent.id_unite),
      "calendrier.date": new Date("2020-04-02")
     /* "calendrier.date": {
        $gte: start,
        $lte: end,
    },*/
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
    $match: {
      "team.agents.agent": ObjectId(agent._id),
    },
  },
  {
    $project: {
      _id: "$team._id",
    },
  },
]);


if(id_team.length == 0)
  return null
else
  return id_team[0]._id
}


exports.getTeamAndroid = catchAsync(async (req, res, next) => {

  const team_id = req.params.id || await getTeamId(req.agent)

  console.log(team_id);
  
  
  
  
  const team = await Planning.aggregate([{
      $unwind: "$calendrier",
    },
    {
      $unwind: "$calendrier.team",
    },
    {
      $match: {
        id_unite: ObjectId(req.agent.id_unite),
        "calendrier.team._id": ObjectId(team_id),
      },
    },
    {
      $project: {
        _id: 0,
        team: "$calendrier.team",
        "calendrier.date": 1,
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
          username: "$team.schoolInfo.username",
          type: "$team.agents.type",
          engin: "$team.engin",
          date: "$calendrier.date",
          disponibilite: "$team.disponibilite",
          gps_coordonnee: "$team.gps_coordonnee",
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
          date: "$team.date",
          disponibilite: "$team.disponibilite",
          gps_coordonnee: "$team.gps_coordonnee",
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
        date: "$_id.date",
        disponibilite: "$_id.disponibilite",
        gps_coordonnee: "$_id.gps_coordonnee",
        agents: "$agents",
      },
    },
  ]);

  var data = team[0]
  res.status(200).json(data);
});