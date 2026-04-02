const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    workspace_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["Member", "Admin"],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Membership", membershipSchema);
