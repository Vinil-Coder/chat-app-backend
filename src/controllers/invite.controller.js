const {
    sendInviteService,
    verifyInviteService,
    registerWithInviteService,
    getReceivedInvitesService,
    getSentInvitesService,
    updateInviteService
} = require("../services/invite.service");
const Conversation = require("../models/conversation.model");

// SEND INVITE
const sendInvite = async (req, res) => {
    try {
        const invite = await sendInviteService({
            ...req.body,
            inviter: req.user
        });

        res.json({ success: true, invite });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// VERIFY
const verifyInvite = async (req, res) => {
    try {
        const data = await verifyInviteService(req.params.token);
        res.json({ success: true, message: "Verified successfully", ...data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// REGISTER
const registerWithInvite = async (req, res) => {
    try {
        await registerWithInviteService(req.body);
        res.json({ success: true, message: "Registered & joined workspace" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// RECEIVED
const getReceivedInvites = async (req, res) => {
    try {
        const invites = await getReceivedInvitesService(req.user.contact);
        res.json({ success: true, invites });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// SENT
const getSentInvites = async (req, res) => {
    try {
        const invites = await getSentInvitesService(req.user.id);
        res.json({ success: true, invites });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE
const updateInvite = async (req, res) => {
    try {
        await updateInviteService({
            inviteId: req.params.inviteId,
            status: req.params.status,
            userId: req.user.id
        });

        res.json({ success: true, message: "Updated successfully" });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    sendInvite,
    verifyInvite,
    registerWithInvite,
    getReceivedInvites,
    getSentInvites,
    updateInvite
};