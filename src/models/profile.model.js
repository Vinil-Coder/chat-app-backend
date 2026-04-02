const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
    },
    country: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    avatarUrl: {
        type: String,
        default: ''
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

module.exports = mongoose.model("Profile", profileSchema);
