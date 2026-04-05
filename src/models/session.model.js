const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userAgent: String,
    refreshToken: String,
    loginTime: {
        type: Date,
        default: Date.now
    },
    logoutTime: Date,
    ipAddress: String,
    device: String,
    isValid: {
        type: Boolean,
        default: true
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: Date

}, { timestamps: true });

module.exports = mongoose.model("Session", SessionSchema);