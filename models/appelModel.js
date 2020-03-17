const mongoose = require("mongoose");

const appelSchema = new mongoose.Schema({
    numTel: {
        type: String,
        required: [true, "Vous devez saisir un numéro"]
    },
    gps_coordonnee: {
        latitude: {
            type: Number,
            required: [true, "Vous devez saisir le latitude"]
        },
        longitude: {
            type: Number,
            required: [true, "Vous devez saisir la longitude"]
        },
    },
    dateTimeAppel: {
        type: Date,
        default: dateTime
    },
});




const Appel = mongoose.model("Appel", appelSchema);

module.exports = Appel;