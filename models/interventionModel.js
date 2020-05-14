const mongoose = require("mongoose");
const dateTime = require("../utils/moment").dateTime;

const interventionSchema = new mongoose.Schema({
  numTel: {
    type: String,
    required: [true, "Vous devez saisir un numéro"],
  },
  adresse: {
    wilaya: {
      type: String,
    },
    daira: {
      type: String,
    },
    adresse_rue: {
      type: String,
    },
    gps_coordonnee: {
      lat: {
        type: Number,
        required: [true, "Vous devez saisir le lat"],
      },
      lng: {
        type: Number,
        required: [true, "Vous devez saisir la lng"],
      },
    },
  },
  cco_agent: {
    type: mongoose.Schema.ObjectId,
    ref: "Agent",
  },
  id_team: {
    type: mongoose.Schema.ObjectId,
  },
  id_unite: [
    {
      // une intervention pourrait provenir d'une ou de plusieurs unités dans le cas de renfort
      type: mongoose.Schema.ObjectId,
      ref: "Unite",
    },
  ],

  // dateTimeAppel == l'heure de l'appel entrant
  dateTimeAppel: {
    type: Date,
    default: dateTime,
  },
  // dateTimeDepart == l'heure du départ de la véhicule
  dateTimeDepart: {
    type: Date,
  },
  // dateTimeArrive == l'heure d'arrivé à l'accident
  dateTimeArrive: {
    type: Date,
  },
  // dateTimeFin == l'heure de la fin des traitement , sois ki youwasslou l'hopital sois ki ykamlou traitement nta3houm
  dateTimeFin: {
    type: Date,
  },
  // description_automatique == les choix de CCO comme accident ou un feu
  description_automatique: {
    type: String,
  },
  // description_initial == la description de chef d'agrés
  description_initial: {
    type: String,
  },
  statut: {
    type: String,
    enum: ["entre", "en_cours", "termine"],
    default: "entre",
  },
});

const Intervention = mongoose.model("Intervention", interventionSchema);

module.exports = Intervention;
