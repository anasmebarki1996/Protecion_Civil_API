//const Tree = require("../models/treeModel");
const Node = require("../models/treenodeModel");
const catchAsync = require('../utils/catchAsync');
const AppError = require("./../utils/appError");

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



// return nodes of a specified parentNode_id 
exports.getNodes = catchAsync(async (req, res, next)=>{
    //if parentNode_id is not set in the request then set it to NUll
    const parent_id = req.body.parent_id || null

    /*
        this instruction will return all the nodes of the tree in which they 
        have the same parentNode_id if it is null then it will return the nodes of the first level
    */
    const tree_level = await Node.find({parent_id:parent_id});

    res.status(200).json({
        status: "success",
        
        data:{
            tree_level
        }
    })
})


exports.createNode = catchAsync(async (req, res)=>{

    const data = await Node.create({
        name:req.body.name,
        description:req.body.description,
        icon:req.body.icon,
        //if this node has parentNode_id == null then it means it a level 1 node 
        parent_id:req.body.parent_id || null
    })

    res.status(200).json({
        status: "success",
        data
    })
})



exports.updateNode = catchAsync(async (req, res, next) => {
    if(!req.body._id)
        return next(new AppError("_id is not defined",400))


    const _id = req.body._id

    let update = {}
    if(req.body.name) update["name"] = req.body.name
    if(req.body.icon) update["icon"] = req.body.icon
    if(req.body.description) update["description"] = req.body.description
       
   

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

    if(!req.body._id)
        return next(new AppError("_id is not defined",400))
        

    const _id = req.body._id

    await Node.deleteOne({_id:_id},function(err){
        if(err) return next(new AppError(err.message,err.status))
        res.status(200).json({
            status:"success"
        })
    })

    
})







