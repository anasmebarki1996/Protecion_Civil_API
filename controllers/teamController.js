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
  const team = await Planning.findOneAndUpdate({
      id_unite: ObjectId(req.agent.id_unite),
      "calendrier.team._id": ObjectId(req.body.id_team),
    }, {
      $set: {
        "calendrier.$[].team.$[a].gps_coordonnee.lat": req.body.gps_coordonnee.lat,
        "calendrier.$[].team.$[a].gps_coordonnee.lng": req.body.gps_coordonnee.lng,
        "calendrier.$[].team.$[a].gps_coordonnee.lastUpdate": dateTime,
      },
    }, {
      arrayFilters: [{
        "a._id": ObjectId(req.body.id_team),
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
  const id_team = await Planning.aggregate([{
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
        team: "$calendrier.team",
      },
    },
    {
      $unwind: "$team.agents",
    },
    {
      $match: {
        "team.agents._id": ObjectId(req.agent.id_agent),
      },
    },
    {
      $project: {
        _id: "$team._id",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    id_team,
  });
});