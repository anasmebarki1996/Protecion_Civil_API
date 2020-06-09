const mongoose = require("mongoose");
const date = require("../utils/moment").date;
const dateTime = require("../utils/moment").dateTime;

const planningSchema = new mongoose.Schema({
    id_unite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unite",
    },

    calendrier: [{
        date: {
            type: Date,
            required: [true, "Vous devez saisir la date."],
            default: date
        },
        team: [{
            agents: [{
                agent: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Agent",
                },
                type: {
                    type: String,
                    enum: ["secours", "chef", "chauffeur"],
                    default: "secours",
                },
            }, ],
            engin: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Engin",
            },
            gps_coordonnee: {
                lat: {
                    type: Number,
                    required: [true, "Une Unitée  doit avoir lat "]
                },
                lng: {
                    type: Number,
                    required: [true, "Une Unitée  doit avoir lng "]
                },
                lastUpdate: {
                    type: Date,
                    default: dateTime,
                }
            },
            disponibilite: {
                type: Boolean,
                default: true
            },
        }, ],
    }, ],
});

const Planning = mongoose.model("Planning", planningSchema);

module.exports = Planning;