const mongoose = require("mongoose");

const enginSchema = new mongoose.Schema({
    
    type: {
        type: String,
        enum: ["ambulance sanitaire", "ambulance medicalise", "FPT"],
        required: [true, "Vous devez saisir le type d'engin"]
    },
    matricule: {
        type: String,
        required: [true, "Vous devez saisir le matricule"]
    },
    panne: {
        type: Boolean,
        default: true
    }

});




const Engin = mongoose.model("Engin", enginSchema);

module.exports = Engin;