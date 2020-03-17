const mongoose = require("mongoose");
const dateTime = require("../utils/moment").dateTime;

const Unite_secondaireSchema = new mongoose.Schema({
    nom: {
        type:Date,
        default:dateTime,

    },
    willaya:{
        type:String,
        required:[true, "le champ willaya est obligatoire"]
    },
    daira:{
        type:String,
        required:[true, "le champ daira  est obligatoire"]
    },
    commune:{
        type:String,
        required:[true, "le champ commune est obligatoire"]
    },
    adresse_rue:{
        type:String,
        required:[true,"adresse de rue est obligatoired"]
    },
    chef_unite:{
        type:mongoose.Schema.ObjectId,
        ref: 'Agent'
    },

    gps_coordonnee: {
        latitude:{
            type:Number,
            required:[true,"Une Unitée secondaire doit avoir latitude "]
        },
        longitude:{
            type:Number,
            required:[true,"Une Unitée secondaire doit avoire longitude "]
        },
    },
    
   









});




const Unite_secondaire = mongoose.model("Unite_secondaire", Unite_secondaireSchema);

module.exports = Unite_secondaire;