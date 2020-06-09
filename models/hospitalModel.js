const mongoose = require("mongoose");
const dateTime = require("../utils/moment").dateTime;
const validator = require("validator");
const bcrypt = require("bcrypt");

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        unique:true
    },
    gps_coordonnee: {
        lat: {
            type: Number,
            required: [true, "Vous devez saisir latitude"],
        },
        lng: {
            type: Number,
            required: [true, "Vous devez saisir longitude"],
        },
    },
    numTel: {
        type: String,
        required: [true, "Vous devez saisir un numéro telephone"],
        unique:true
    },


    created_at: {
        type: Date,
        default: dateTime
    },

});


const Hospital = mongoose.model("Hospital", hospitalSchema);

module.exports = Hospital;