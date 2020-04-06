const mongoose = require("mongoose");

const treeSchema = new mongoose.Schema({
    niv1: {
        niv1_type: {
            type: String,
            required: [true, "Vous devez saisir le type de niveau 1."],
            unique: [
                true,
                "Ce type existe déja"
            ],
        },
        niv2: [{
            niv2_type: {
                type: String,
                required: [true, "Vous devez saisir le type de niveau 2."],
            },
            decision: {
                protection: [{
                    type: String,
                    enum: [
                        "ambulance_medicalise",
                        "ambulance_sanitaire",
                        "FPT",
                        "EPA",
                        "CCFM",
                    ],
                    required: [
                        true,
                        "Vous devez saisir un moyen de protection civil",
                    ],
                    // FPT
                    // CCFM
                    // EPA : FPT + echelle
                }, ],
                // securite = police ou gendarme
                securite: {
                    type: Boolean,
                    default: false,
                    require: true,
                },
                //
                sante: {
                    type: Boolean,
                    default: false,
                    require: true,
                },
            },
        }, ],
    },
});

const Tree = mongoose.model("Tree", treeSchema);

module.exports = Tree;