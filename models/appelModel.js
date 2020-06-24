const mongoose = require("mongoose");
const moment = require('moment-timezone');

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

    },

});

appelSchema.pre("save", async function (next) {
    this.dateTimeAppel = moment().tz("Africa/Algiers").format("YYYY-MM-DD HH:mm:ss");
    next();
});


const Appel = mongoose.model("Appel", appelSchema);

module.exports = Appel;