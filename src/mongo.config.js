const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const userModel = require("./models/user.model");
const profileModel = require("./models/profile.model");
const accountModel = require("./models/account.model");
const sessionModel = require("./models/session.model");
const workspaceModel = require("./models/workspace.model");
const chatModel = require("./models/chat.model");
const memberShipModel = require("./models/membership.model");
const messageModel = require("./models/message.model");
const activityModel = require("./models/activity.model");

module.exports = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};
