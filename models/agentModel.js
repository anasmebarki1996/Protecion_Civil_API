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
    },
    prenom: {
        type: String,
        required: [true, "Vous devez saisir un prénom"],
        trim: true,
        maxlength: [40, "Un prénom ne peut avoir plus de 40 caractères."],
        minlength: [3, "Un prénom ne peut avoir moins de 3 caractères."],
        validate: {
            validator: function (el) {
                return validator.isAlpha(validator.blacklist(el, " "));
            },
            message: "Un prénom ne peut avoir que les caractères."
        },
    },
    date_de_naissance: {
        type: Date,
        required: [true, "Vous devez saisir une date"]
    },
    username: {
        type: String,
        required: [true, "Vous devez saisir un nom d'utilisateur"],
        minlength: [4, "un nom d'utilisateur ne peut avoir moins de 4 caractères."],
        unique: [
            true,
            "Nom d'utilisateur est déja utilisé. Vouliez saisir un nouveau!"
        ],
        validate: {
            validator: function (el) {
                return validator.isAlphanumeric(el);
            },
            message: "le nom d'utilisateur ne peut avoir que les caractères a-z,A-Z,0-9."
        }
    },
    numTel: {
        type: String,
        unique: [
            true,
            "Ce numéro est déja utilisé. Vouliez saisir un nouveau!"
        ],
    },
    // .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i");
    password: {
        type: String,
        required: [true, "Vous devez saisir un mot de passe"],
        minlength: [8, "Le mot de passe ne peut avoir moins de 8 caractères."],
        validate: {
            validator: function (el) {
                return validator.matches(el, /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/);
            },
            message: "Le mot de passe doit avoir au minimum un maj et un min et num et un spécial caractere"
        },
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
    id_unite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unite",
        required: [true, "Vous devez saisir l'unité"],
    },
    role: {
        type: String,
        enum: ["admin", "cco_agent", "agent"],
        default: "agent"
    },
    created_at: {
        type: Date,
        default: dateTime
    },
    passwordChangedAt: {
        type: Date
    }
});

agentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

agentSchema.methods.checkPassword = async function (
    condidatePassword,
    agentPassword
) {
    return await bcrypt.compare(condidatePassword, agentPassword);
};

agentSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimesTamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimesTamp;
    }
    return false;
};

const Agent = mongoose.model("Agent", agentSchema);

module.exports = Agent;