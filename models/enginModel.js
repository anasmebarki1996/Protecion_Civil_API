const mongoose = require("mongoose");

const enginSchema = new mongoose.Schema({
    
    type: {
        type: String,
        //enum: ["ambulance sanitaire", "ambulance medicalise", "FPT"],
        required: [true, "Vous devez saisir le type d'engin"],
        
    },
    code_name:{
        type:String,
        required:[true, " vous devez specifier le code name d'engin."]
    },
    matricule: {
        type: String,
        required: [true, "Vous devez saisir le matricule"],
        
    },
    panne: {
        type: Boolean,
        default: false,
        
    }

});




const Engin = mongoose.model("Engin", enginSchema);

module.exports = Engin;