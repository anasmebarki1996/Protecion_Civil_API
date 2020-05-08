const mongoose = require("mongoose");

const enginSchema = new mongoose.Schema({
    name:{
        type:String,
        required : [true,"Vous devez specifier le nom complet d'engin"]
    },
    code_name: {
        type: String,
        //enum: ["ambulance_sanitaire", "ambulance_medicalise", "FPT"],
        //required: [true, " vous devez specifier le code name d'engin."]
        default:""
    },
    

    /*engin_type:{
        vehicule_type:{
            type:String,
            //enum:["ambulance","camion","simple"] ,
            require:[true,"vous devez specifier le type d'engin."]
        },
        engin_type2:{
            type:String,
            enum:["ambulance","camion","vehicule"] ,
            require:[true,"vous devez specifier le type d'engin."]
        },
    },*/

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