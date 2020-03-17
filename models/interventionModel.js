const mongoose = require("mongoose");
const dateTime = require("../utils/moment").dateTime;

const interventionSchema = new mongoose.Schema({
    created_at: {
        type: Date,
        default: dateTime
    },
    agents: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Agent'
    }],
    unite_secondaire:[{ // une intervention pourrait provenir d'une ou de plusieurs unités dans le cas de renfort
        type:mongoose.Schema.ObjectId,
        ref:"Unite_secondaire"
    }],
    date_sortie: {
        type:Date,
        default:dateTime,

    },
    date_entree: {
        type:Date,
        
    },
    description_initial:{
        type:String,
        //required:[true,"Une description intial de l'intervention est obligatoire"],
    },
    









    message: [{
        body: {
            type: String,
            required: [true, "An agent must send a message"],
            minlength: [1, "A message must have more or equal then 1 characters"],
            maxlength: [100, "A message must have less or equal then 100 characters"],
        },
        created_at: {
            type: Date,
            default: dateTime
        },
        status: {
            type: String,
            default: "envoye",
            enum: ["envoye", "recu", "vu"]
        },
        sender: {
            type: mongoose.Schema.ObjectId,
            ref: 'Agent'
        }
    }],
});




const Intervention = mongoose.model("Intervention", interventionSchema);

module.exports = Intervention;