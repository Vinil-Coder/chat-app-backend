const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const UserModel = require("./models/user.model");
const ProfileModel = require("./models/profile.model");
const AccountModel = require("./models/account.model");
const SessionModel = require("./models/session.model");
const inviteModel = require("./models/invite.model");
const ContactModel = require("./models/contact.model");
const ConversationModel = require("./models/conversation.model");
const WorkspaceModel = require("./models/workspace.model");
const WorkspaceMemberModel = require("./models/workspaceMember.model");
const MessageModel = require("./models/message.model");
const ActivityModel = require("./models/activity.model");

module.exports = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};
