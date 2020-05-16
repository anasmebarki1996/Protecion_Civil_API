const mongoose = require("mongoose");

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
   
});




const Appel = mongoose.model("Appel", appelSchema);

module.exports = Appel;