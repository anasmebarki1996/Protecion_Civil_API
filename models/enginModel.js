const mongoose = require("mongoose");

const enginSchema = new mongoose.Schema({
    code_name: {
        type: String,
        enum: ["ambulance_sanitaire", "ambulance_medicalise", "FPT"],
        required: [true, " vous devez specifier le code name d'engin."]
    },
    matricule: {
        type: String,
        required: [true, "Vous devez saisir le matricule"],
        unique: [
            true,
            "Cet enign existe déja. Vouliez saisir un nouveau!"
        ],
    },
    panne: {
        type: Boolean,
        default: false
    },
    id_unite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unite",
    },
});




const Engin = mongoose.model("Engin", enginSchema);

module.exports = Engin;