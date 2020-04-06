const mongoose = require("mongoose");



const nodeSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Le nom d'element de l'arbre est obligatoir."]
    },
    icon:{
        type:String,
        default:null
    },
    description:{
        type:String,
        require:[false,"Vous devez saisir la description de cet element"]
    },
    //if this node has parentNode_id == null then it means it a level 1 node 
    parent_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Node'
    }


});


const Node = mongoose.model("Node", nodeSchema);

module.exports = Node;