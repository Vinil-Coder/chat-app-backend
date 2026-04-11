const {
    sendInviteService,
    verifyInviteService,
    registerWithInviteService,
    getReceivedInvitesService,
    getSentInvitesService
} = require("../services/invite.service");

// SEND INVITE
const sendInvite = async (req, res) => {
    try {
        const invite = await sendInviteService({
            ...req.body,
            inviter: req.user
        });

        res.status(200).json({ success: true, message: "Invite sent successfully",  invite });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// VERIFY
const verifyInvite = async (req, res) => {
    try {
        await verifyInviteService(req.params.token);

        res.status(200).json({ success: true, message: "Invite Verified successfully" });

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

module.exports = {
    sendInvite,
    verifyInvite,
    registerWithInvite,
    getReceivedInvites,
    getSentInvites
};