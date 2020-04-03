const mongoose = require("mongoose");


const treeSchema = new mongoose.Schema({
    initial: {
        niv1: [{
            niv1_type: {
                type: String,
                required: [true, "Vous devez saisir le type de niveau 1."],
            },
            niv2: [{
                niv2_type: {
                    type: String,
                    required: [true, "Vous devez saisir le type de niveau 2."],
                },
                // decision: [{
                //     protection: [{
                //         engin: {
                //             type: String,
                //             enum: ["ambulance_medicalise", "ambulance_sanitaire", "FPT", "EPA", "CCFM"]
                //             // FPT 
                //             // CCFM 
                //             // EPA : FPT + echelle
                //         }
                //     }],
                //     // securite = police ou gendarme
                //     securite: {
                //         type: Boolean,
                //         default: false,
                //         require: true
                //     },
                //     //
                //     sante: {
                //         type: Boolean,
                //         default: false,
                //         require: true
                //     }
                // }]
            }]
        }]
    },

});


const Tree = mongoose.model("Tree", treeSchema);

module.exports = Tree;