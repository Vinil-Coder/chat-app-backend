const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["direct", "group"],
        required: true,
        default: "direct"
    },
    name: {
        type: String,
        trim: true
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace"
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"  
    }
}, { timestamps: true });

module.exports = mongoose.model("Conversation", ConversationSchema);
