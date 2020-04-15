const mongoose = require("mongoose");
const dateTime = require("../utils/moment").dateTime;

const UniteSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, "Une unité doit avoir un nom"],
        unique: [true, "cette unité existe déja"],
    },
    adresse: {
        willaya: {
            type: String,
            required: [true, "le champ willaya est obligatoire"]
        },
        daira: {
            type: String,
            required: [true, "le champ daira  est obligatoire"]
        },
        adresse_rue: {
            type: String,
            required: [true, "adresse de rue est obligatoired"]
        },
        gps_coordonnee: {
            latitude: {
                type: Number,
                required: [true, "Une Unitée  doit avoir latitude "]
            },
            longitude: {
                type: Number,
                required: [true, "Une Unitée  doit avoir longitude "]
            },
        },
    },
    chef_unite: {
        type: mongoose.Schema.ObjectId,
        ref: 'Agent'
    },
    type: {
        type: String,
        enum: ['principale', 'secondaire'],
        default: "secondaire",
        required: [true, "Une Unitée doit avoir un type "],
    },
    unite_principale: {
        type: mongoose.Schema.ObjectId,
        ref: "Unite"
    }

});

const Unite = mongoose.model("Unite", UniteSchema);

module.exports = Unite;