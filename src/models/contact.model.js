const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    contactUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "blocked"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);
