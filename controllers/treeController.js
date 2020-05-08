//const Tree = require("../models/treeModel");
const Node = require("../models/treenodeModel");
const catchAsync = require('../utils/catchAsync');
const AppError = require("./../utils/appError");
const mongoose = require("mongoose");
const treeValidator = require("./../validators/treeValidator");
const Engin = require("../models/enginModel");


var tree = async function (parent_id){
    
    var nodes = await Node.find({parent_id:parent_id})
   
    //condition d'arret
    if(nodes.length == 0)
        return []

    for(let i=0;i<nodes.length;i++){
        nodes[i] = nodes[i]._doc
        
        
        nodes[i].children = await tree(nodes[i]._id)
        
    }
    
    return nodes
}


//get the whole Tree with all of its nodes 
exports.displayTree = catchAsync(async (req, res , next)=>{


    

    res.status(200).json({
        data:await tree(null)
    })
})

exports.getNodePath = catchAsync(async (req , res ,next)=>{

    var child_id = req.params.child_id || null

    if(!mongoose.isValidObjectId(child_id))
        return next(new AppError("Node Id is Not Valid",400))
    
        
    var data = []
    var test = true
    var tmp

   
    
    while(test){
        tmp =await Node.findOne({_id:child_id},["parent_id","name"])
        
        


        if(tmp == null)
            break

        data.push(tmp)
        if(tmp.parent_id == null)
            break

        child_id = tmp.parent_id    
    }
    res.status(200).json({
        status:"success",
        data
        
      
    })
})


// return nodes of a specified parentNode_id 
exports.getNodes = catchAsync(async (req, res, next)=>{
    //if parentNode_id is not set in the request then set it to NUll
    const parent_id = req.params.parent_id || null

    if(!mongoose.isValidObjectId(parent_id))
        return next(new AppError("Node Id is Not Valid",400))
    

    /*
        this instruction will return all the nodes of the tree in which they 
        have the same parentNode_id if it is null then it will return the nodes of the first level
    */
    const data = await Node.find({parent_id:parent_id});

    res.status(200).json({
        status: "success",
        
        data
    })
})

// return nodes of a specified parentNode_id 
exports.getNode = catchAsync(async (req, res, next)=>{
    //if parentNode_id is not set in the request then set it to NUll
    const id = req.params.id || null

    if(!mongoose.isValidObjectId(id))
        return next(new AppError("Node Id is Not Valid",400))
    

    /*
        this instruction will return all the nodes of the tree in which they 
        have the same parentNode_id if it is null then it will return the nodes of the first level
    */
    const data = await Node.find({_id:id});

    res.status(200).json({
        status: "success",
        
        data
    })
})


exports.createNode = catchAsync(async (req, res)=>{
    

    const data = await Node.create({
        name:req.body.name,
        description:req.body.description,
        icon:req.body.icon,
        decision:{
            intern:req.body.decision.intern || [],
            extern:req.body.decision.extern || []
        },
        Conseils_instructions:req.body.Conseils_instructions || [],
        //if this node has parentNode_id == null then it means it a level 1 node 
        parent_id:req.body.parent_id || null

    })

    res.status(200).json({
        status: "success",
        data
    })
})



exports.updateNode = catchAsync(async (req, res, next) => {
    if(!req.params.id)
        return next(new AppError("Node Id is not defined",400))


    const _id = req.params.id

    

    let update = {}
    if(req.body.name) update["name"] = req.body.name
    if(req.body.icon) update["icon"] = req.body.icon
    if(req.body.description) update["description"] = req.body.description

    var intern = []
    var extern = []

    if(req.body.decision){
         intern = req.body.decision.intern || []
         extern = req.body.decision.extern || []
    }
    var Conseils_instructions = []
    if(req.body.Conseils_instructions){
         Conseils_instructions = req.body.Conseils_instructions || []
    }
        //if(treeValidator.intern_decision_validator())
        const node = await Node.findByIdAndUpdate({_id:_id},req.body)
                                     /*   {
                                            $addToSet:{
                                                "decision.intern":{$each:intern}
                                            },
                                            $addToSet:{
                                                "decision.extern":{$each:extern}
                                            },
                                            $addToSet:{
                                                "Conseils_instructions":{$each:Conseils_instructions}
                                            }
                                        })*/
        

    
        
       
   

    await Node.updateOne({_id:_id},update,async function(err){
        
        if(err) return next(new AppError(err.message,err.status))
        const data = await Node.findById(_id)


        res.status(200).json({
            
            status:"success",
            data
        });

    })
});


exports.deleteNode = catchAsync(async (req, res,next)=>{

    /*
    if(!req.body._id)
        return next(new AppError("_id is not defined",400))
    */

    const id = req.params.id || null



    await Node.deleteOne({_id:id},function(err){
        if(err) return next(new AppError(err.message,err.status))
        
        res.status(200).json({
            status:"success"
        })
    })

    
})



exports.getAllEngins = catchAsync(async (req, res , next)=>{
    
    const engins = await Engin.aggregate([{$group:{_id:'$name',name:{$first:"$code_name"}}}])
    res.status(200).json({
        status:"success",
        data:engins

    })
})







