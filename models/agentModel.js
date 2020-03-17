const mongoose = require("mongoose");
const dateTime = require("../utils/moment").dateTime;
const validator = require("validator");
const bcrypt = require("bcrypt");

const agentSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, "Vous devez saisir un nom."],
        trim: true,
        maxlength: [40, "Un nom ne peut avoir plus de 40 caractères."],
        minlength: [3, "Un nom ne peut avoir moins de 3 caractères."],
        validate: [validator.isAlpha, "Un nom ne peut avoir que les caractères."],
        select: false
    },
    prenom: {
        type: String,
        required: [true, "Vous devez saisir un prénom"],
        trim: true,
        maxlength: [40, "Un prénom ne peut avoir plus de 40 caractères."],
        minlength: [3, "Un prénom ne peut avoir moins de 3 caractères."],
        validate: [validator.isAlpha, "Un prénom ne peut avoir que les caractères."]
    },
    date_de_naissance: {
        type: Date,
        required: [true, "Vous devez saisir une date"]
    },
    username: {
        type: String,
        required: [true, "Vous devez saisir un nom d'utilisateur"],
        unique: [true, "Nom d'utilisateur est déja utilisé. Vouliez saisir un nouveau!"],
    },
    password: {
        type: String,
        required: [true, "Vous devez saisir un mot de passe"],
        minlength: [8, "Le mot de passe ne peut avoir moins de 8 caractères."],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Vous devez saisir un mot de passe"],
        minlength: [8, "Le mot de passe ne peut avoir moins de 8 caractères."],
        validate: {
            // it works only on create and save
            validator: function (el) {
                return el === this.password;
            },
            message: "Les mots de passe ne sont pas identiques"
        }
    },
    role: {
        type: String,
        enum: ['admin', 'cco_agent', 'chef', 'agent'], // chef = Chef d'agrès
        default: 'agent'
    },
    created_at: {
        type: Date,
        default: dateTime
    },
    passwordChangedAt: {
        type: Date,
    },
});

agentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});


agentSchema.methods.checkPassword = async function (condidatePassword, agentPassword) {
    console.log(condidatePassword + "_" + agentPassword)

    return await bcrypt.compare(condidatePassword, agentPassword);
}


agentSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimesTamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimesTamp;
    }
    return false;
}


const Agent = mongoose.model("Agent", agentSchema);

module.exports = Agent;