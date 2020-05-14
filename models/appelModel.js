const mongoose = require("mongoose");
const dateTime = require("./../utils/moment").dateTime;

const appelSchema = new mongoose.Schema({
    numTel: {
        type: String,
        required: [true, "Vous devez saisir un numéro"]
    },
    gps_coordonnee: {
        lat: {
            type: Number,
            required: [true, "Vous devez saisir le lat"]
        },
        lng: {
            type: Number,
            required: [true, "Vous devez saisir la lng"]
        },
    },
    dateTimeAppel: {
        type: Date,
        default: dateTime
    },
});




const Appel = mongoose.model("Appel", appelSchema);

module.exports = Appel;