const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: String,
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'file'],
        default: 'text'
    },
    attachments: [String],
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isMessagePinned: Boolean,
    isEdited: Boolean,
    isDeleted: Boolean
}, { timestamps: true });

MessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);