const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    provider: {
        type: String,
        enum: ["local", "google", "github"],
        default: "local"
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    role: {
        type: String,
        enum: ["Member", "Admin"],
        default: "Admin"
    }

}, { timestamps: true });

module.exports = mongoose.model("Account", AccountSchema);