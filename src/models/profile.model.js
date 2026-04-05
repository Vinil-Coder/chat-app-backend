const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
    },
    country: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    githubUrl: {
        type: String,
        default: ''
    },
    linkedinUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model("Profile", ProfileSchema);
