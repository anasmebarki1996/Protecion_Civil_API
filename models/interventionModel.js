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
  // cco agent de l'unite principale   
  cco_agent_principale: {
    type: mongoose.Schema.ObjectId,
    ref: "Agent",
  },
  cco_agent_secondaire: {
    type: mongoose.Schema.ObjectId,
    ref: "Agent",
  },
  id_unite_principale: {
    type: mongoose.Schema.ObjectId,
    ref: "Unite",
  },
  // unite secondaire 
  id_unite: {
    type: mongoose.Schema.ObjectId,
    ref: "Unite",
  },
  id_node: {
    type: mongoose.Schema.ObjectId,
    ref: "Node",
    required: [true, "Vous devez saisir le type d'intervention"],
  },
  // description = les choix de CCO comme accident ou un feu
  description: {
    type: Array,
    required: [true, "Vous devez saisir le type d'intervention"],
  },
  // la description de chef d'agrés
  bilan: {
    type: String,
  },
  id_team: {
    type: mongoose.Schema.ObjectId,
  },
  // dateTimeAppel == l'heure de l'appel entrant
  dateTimeAppel: {
    type: Date,
    default: dateTime,
  },
  // dateTimeDepart == l'heure du départ de l'engin'
  dateTimeDepart: {
    type: Date,
  },
  // dateTimeArrive == l'heure d'arrivé à l'accident
  dateTimeArrive: {
    type: Date,
  },
  // si il y a un transfere vers l'hopital par exemple et le temps d'arrivé a l'hopital = temps fin
  transfere: {
    lieu: {
      type: String,
    },
    dateTimeDepart: {
      type: Date,
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
  // dateTimeFin == l'heure de la fin des traitement , sois ki youwasslou l'hopital sois ki ykamlou traitement nta3houm
  dateTimeFin: {
    type: Date,
  },
  statut: {
    type: String,
    enum: ["envoye", "recu", "depart", "en_cours", "transfere", "termine", "annule"],
    default: "envoye",
    // envoye à l'unité la plus proche
    // recu => envoyé au chef d'agrée
    // depart => accepté par le chef d'agrée
    // en_cours => arrivé à la distination
    // transfere => trasfere vers un hopital
    // terminé => 
    // annule
  },
});

const Intervention = mongoose.model("Intervention", interventionSchema);

module.exports = Intervention;