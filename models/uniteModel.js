const mongoose = require("mongoose");

const UniteSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, "Une unité doit avoir un nom"],
        unique: [true, "cette unité existe déja"],
    },
    adresse: {
        wilaya: {
            type: String,
            required: [true, "le champ wilaya est obligatoire"]
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
            lat: {
                type: Number,
                required: [true, "Une Unitée  doit avoir lat "]
            },
            lng: {
                type: Number,
                required: [true, "Une Unitée  doit avoir lng "]
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
    },
    numTel: {
        type: String,
        required: [true, "Une Unitée doit avoir un numero de téléphone "],
    }

});

const Unite = mongoose.model("Unite", UniteSchema);

module.exports = Unite;