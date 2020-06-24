const mongoose = require("mongoose");
const moment = require('moment-timezone');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
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
        unique: true
    },
    created_at: {
        type: Date,
    },
});
hospitalSchema.pre("save", async function (next) {
    this.dateTimeAppel = moment().tz("Africa/Algiers").format("YYYY-MM-DD HH:mm:ss");
    next();
});

const Hospital = mongoose.model("Hospital", hospitalSchema);

module.exports = Hospital;