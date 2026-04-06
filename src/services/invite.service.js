const crypto = require("crypto");
const WorkspaceMember = require("../models/workspaceMember.model");
const Workspace = require("../models/workspace.model");
const Invite = require("../models/invite.model");
const Conversation = require("../models/conversation.model");
const sendEmail = require("../utils/email");
const { registerService } = require("./auth.service");
const generateInviteHtmlTemplate = require("../utils/htmlTemplates");

// SEND INVITE
const sendInviteService = async ({ email, contact, workspaceId, inviter }) => {

    const isInvited = await Invite.findOne({
        email,
        workspaceId,
        status: "pending"
    });

    if (isInvited) return res.status(400).json({ message: "Already invited", success: false });;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(400).json({ message: "Workspace not exists", success: false });;

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await Invite.create({
        email,
        contact,
        workspaceId,
        invitedBy: inviter.id,
        inviteToken: token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:4200"}/invite/${token}`;

    const subject = `🚀 You're invited to join ${workspace.name} on Chat App`;

    // await sendEmail(email, subject, generateInviteHtmlTemplate(inviter.name, workspace.name, inviteLink));

    return invite;
};

// VERIFY INVITE
const verifyInviteService = async (token) => {

    const invite = await Invite.findOne({ inviteToken: token });

    if (!invite || invite.expiresAt < Date.now()) return res.status(400).json({ message: "Invalid or expired invite", success: false })

    return {
        email: invite.email,
        workspaceId: invite.workspaceId,
        role: invite.role
    };
};

// REGISTER WITH INVITE
const registerWithInviteService = async ({ name, contact, password, token }) => {

    const invite = await Invite.findOne({ inviteToken: token });
    if (!invite) return res.status(400).json({ message: "Invite not found", success: false });

    const user = await registerService({ name, email: invite.email, contact, password })

    const alreadyMember = await WorkspaceMember.findOne({
        workspaceId: invite.workspaceId,
        userId: user._id
    });

    if (alreadyMember) return res.status(400).json({ message: "Already in workspace", success: false });

    await WorkspaceMember.create({
        workspaceId: invite.workspaceId,
        userId: user._id,
        role: invite.role || "member"
    });

    invite.status = "accepted";
    await invite.save();

    if (invite.status === "accepted") {
        await Conversation.findOneAndUpdate(
            { workspaceId: invite.workspaceId },
            { $addToSet: { members: user._id } }
        );
    }

    return user;
};

// GET RECEIVED INVITES
const getReceivedInvitesService = async (contact) => {

    return await Invite.find({ contact })
        .populate("workspaceId")
        .populate("invitedBy");
};

// GET SENT INVITES
const getSentInvitesService = async (userId) => {

    return await Invite.find({ invitedBy: userId })
        .populate("workspaceId")
        .populate("invitedBy");
};

// UPDATE INVITE
const updateInviteService = async ({ inviteId, status, userId }) => {

    const invite = await Invite.findById(inviteId);
    if (!invite) throw new Error("Invite not found");

    await WorkspaceMember.create({
        workspaceId: invite.workspaceId,
        userId,
        inviteId: invite._id
    });

    invite.status = status;
    await invite.save();

    if (status === "accepted") {
        await Conversation.findOneAndUpdate(
            { workspaceId: invite.workspaceId },
            { $addToSet: { members: userId } }
        );
    }

    return true;
};



module.exports = {
    sendInviteService,
    verifyInviteService,
    registerWithInviteService,
    getReceivedInvitesService,
    getSentInvitesService,
    updateInviteService
};