const Engin = require("./../models/enginModel")


exports.intern_decision_validator = async function(v){
    return (await Engin.distinct("code_name")).includes(v)
}