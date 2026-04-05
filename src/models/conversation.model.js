const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["direct", "group"],
        required: true,
        default: "direct"
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace"
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }
}, { timestamps: true });

module.exports = mongoose.model("Conversation", ConversationSchema);
