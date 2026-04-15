const crypto = require("crypto");
const Invite = require("../models/invite.model");
const Conversation = require("../models/conversation.model");
const User = require("../models/user.model");
const sendEmail = require("../utils/email");
const { registerService } = require("./auth.service");
const generateInviteHtmlTemplate = require("../utils/htmlTemplates");

// SEND INVITE
const sendInviteService = async ({ email, contact, inviter }) => {

    const user = await User.findOne({ email });
    if (user) {
        throw new Error("User already exists");
    }

    const isInvited = await Invite.findOne({
        email,
        contact,
        status: "pending"
    });

    if (isInvited) {
        throw new Error("Invite already sent");
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await Invite.create({
        email,
        contact,
        invitedBy: inviter.id,
        inviteToken: token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:4200"}/invite/${token}`;

    const subject = `🚀 You're invited to join on Chat App`;

    await sendEmail(email, subject, generateInviteHtmlTemplate(inviter.name, inviteLink));

    return invite;
};

// VERIFY INVITE
const verifyInviteService = async (token) => {

    const invite = await Invite.findOne({ inviteToken: token });

    if (!invite || invite.expiresAt < Date.now()) {
        throw new Error("Invite expired");
    }

    if (invite.status === "accepted") {
        throw new Error("Invite already accepted");
    }

    return true;
};

// REGISTER WITH INVITE
const registerWithInviteService = async ({ name, contact, password, token }) => {

    const invite = await Invite.findOne({ inviteToken: token });

    if (!invite) {
        throw new Error("Invite not found");
    }

    const user = await registerService({ name, email: invite.email, contact, password })

    await Invite.findByIdAndUpdate({ _id: invite._id }, { status: "accepted" });

    await Conversation.create({
        type: "direct",
        participants: [invite.invitedBy, user._id]
      });

    return user;
};

// GET RECEIVED INVITES
const getReceivedInvitesService = async (contact) => {

    return await Invite.find({ contact })
        .populate("invitedBy");
};

// GET SENT INVITES
const getSentInvitesService = async (userId) => {

    return await Invite.find({ invitedBy: userId })
        .populate("invitedBy");
};


module.exports = {
    sendInviteService,
    verifyInviteService,
    registerWithInviteService,
    getReceivedInvitesService,
    getSentInvitesService
};