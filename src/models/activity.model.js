const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: String,
    metaData: Object
}, { timestamps: true });

module.exports = mongoose.model("Activity", ActivitySchema);