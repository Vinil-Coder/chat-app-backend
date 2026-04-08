const mongoose = require("mongoose");

const InviteSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "expired"],
        default: "pending"
    },
    inviteToken: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Invite", InviteSchema);