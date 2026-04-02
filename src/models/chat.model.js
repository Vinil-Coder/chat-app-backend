const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    workspaceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Workspace' 
    },
    type: { 
        type: String, 
        enum: ['direct', 'group'] 
    },
    name: String,
    members: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }
    ],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);