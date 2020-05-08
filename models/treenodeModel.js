const mongoose = require("mongoose");
const treeValidator = require("./../validators/treeValidator")




const nodeSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Le nom d'element de l'arbre est obligatoir."]
    },
    icon:{
        type:String,
        default:null
    },
    description:{// une description generale de ce type d'accident
        type:String,
        require:[false,"Vous devez saisir la description de cet element"]
    },
    Conseils_instructions:[ //des Conseils et instructions a donner de la part d'agent du cco a la person dans l'appel 
        {
            type:String,

        }
    ],
    //if this node has parentNode_id == null then it means it a level 1 node 
    parent_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Node'
    },
    decision:{
        intern:[ // le type d'engin de la protection civil qui est nécessaire
            {

                type: String,
                
                /*required: [
                    true,
                    "Vous devez spécifier l'engin de protection civil",
                ],
                // FPT
                // CCFM
                // EPA : FPT + echelle*/
            }
        ],
        extern:[ // renfort externe
            {

                type: String,
                enum:["Police","Gendarmerie","Conservation des forêts","Hopital"],
                
                // FPT
                // CCFM
                // EPA : FPT + echelle
            }
        ]
    }


});


const Node = mongoose.model("Node", nodeSchema);

module.exports = Node;