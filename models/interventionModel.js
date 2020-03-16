const mongoose = require("mongoose");
const dateTime = require("../utils/moment").dateTime;

const interventionSchema = new mongoose.Schema({
    created_at: {
        type: Date,
        default: dateTime
    },
    agents: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Agent'
    }],
    message: [{
        body: {
            type: String,
            required: [true, "A agent must send a message"],
            minlength: [1, "A message must have more or equal then 1 characters"],
            maxlength: [100, "A message must have less or equal then 100 characters"],
        },
        created_at: {
            type: Date,
            default: dateTime
        },
        status: {
            type: String,
            default: "envoye",
            enum: ["envoye", "recu", "vu"]
        },
        sender: {
            type: mongoose.Schema.ObjectId,
            ref: 'Agent'
        }
    }],
});




const Intervention = mongoose.model("Intervention", interventionSchema);

module.exports = Intervention;