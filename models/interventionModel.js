const mongoose = require("mongoose");
const dateTime = require("../utils/moment").dateTime;
const date = require("../utils/moment").date;

console.log(dateTime)

const interventionSchema = new mongoose.Schema({
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
    cco_agent: {
        type: mongoose.Schema.ObjectId,
        ref: 'Agent'
    },
    agents: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Agent'
    }],
    unite_secondaire: [{ // une intervention pourrait provenir d'une ou de plusieurs unités dans le cas de renfort
        type: mongoose.Schema.ObjectId,
        ref: "Unite_secondaire"
    }],
    // dateTimeAppel == l'heure de l'appel entrant
    dateTimeAppel: {
        type: String,
        default: dateTime
    },
    // dateTimeDepart == l'heure du départ de la véhicule
    dateTimeDepart: {
        type: String,
    },
    // dateTimeArrive == l'heure d'arrivé à l'accident
    dateTimeArrive: {
        type: String,
    },
    // dateTimeFin == l'heure de la fin des traitement , sois ki youwasslou l'hopital sois ki ykamlou traitement nta3houm
    dateTimeFin: {
        type: String,
    },
    // description_automatique == les choix de CCO comme accident ou un feu
    description_automatique: {
        type: String,
    },
    // description_initial == la description de chef d'agrés
    description_initial: {
        type: String,
    },
});




const Intervention = mongoose.model("Intervention", interventionSchema);

module.exports = Intervention;