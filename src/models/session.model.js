const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    userID: {
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

module.exports = mongoose.model("Session", sessionSchema);