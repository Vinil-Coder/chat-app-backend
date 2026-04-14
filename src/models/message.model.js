const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({

    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        index: true
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
    receiverIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    deliversTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'read'],
        default: 'sent'
    },
    isRead: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false }

}, { timestamps: true });

MessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);