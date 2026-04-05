const crypto = require("crypto");
const User = require("../models/user.model");
const WorkspaceMember = require("../models/workspaceMember.model");
const Workspace = require("../models/workspace.model");
const Invite = require("../models/invite.model");
const sendEmail = require("../utils/email");
const { encryptPassword } = require("../utils/password-encrypted");

const sendInvite = async (req, res) => {
    try {
        const { email, contact, workspaceId } = req.body;

        const existing = await Invite.findOne({
            contact,
            workspaceId,
            status: "pending"
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "Already invited" });
        }

        const workspace = await Workspace.findById(workspaceId);

        const token = crypto.randomBytes(32).toString("hex");

        const invite = await Invite.create({
            email,
            contact,
            workspaceId,
            invitedBy: req.user.id,
            inviteToken: token,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
        });

        // Invite link
        const inviteLink = `http://localhost:4200/invite/${token}`;

        // Email content
        const subject = `🚀 You're invited to join ${workspace.name} on Chat App`;

        const html = `
            <div style="font-family: Arial, sans-serif; background:#f6f9fc; padding:40px 0;">
            <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">

                <!-- Header -->
                <div style="background:#4CAF50; padding:20px; text-align:center; color:#fff;">
                <h1 style="margin:0;">Chat App 💬</h1>
                <p style="margin:5px 0 0;">Collaborate in real-time</p>
                </div>

                <!-- Body -->
                <div style="padding:30px; color:#333;">
                <h2 style="margin-top:0;">You're invited 🎉</h2>
                
                <p style="font-size:16px;">
                    Hello 👋,
                </p>

                <p style="font-size:16px;">
                    ${req.user.name} has invited you to join the workspace <strong>${workspace.name}</strong>.
                </p>

                <p style="font-size:15px; color:#555;">
                    Collaborate with your team, chat in real-time, manage groups, and stay productive — all in one place.
                </p>

                <!-- CTA Button -->
                <div style="text-align:center; margin:30px 0;">
                    <a href="${inviteLink}" 
                    style="display:inline-block; padding:14px 28px; background:#4CAF50; color:#fff; text-decoration:none; font-size:16px; border-radius:6px;">
                    Accept Invitation
                    </a>
                </div>

                <!-- Fallback -->
                <p style="font-size:13px; color:#888;">
                    If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="word-break:break-all; font-size:13px; color:#4CAF50;">
                    ${inviteLink}
                </p>

                <p style="font-size:13px; color:#999;">
                    ⏳ This invitation will expire in 24 hours.
                </p>
                </div>

                <!-- Footer -->
                <div style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#777;">
                <p style="margin:0;">© ${new Date().getFullYear()} Chat App. All rights reserved.</p>
                </div>

            </div>
            </div>
            `;

        // Send email
        await sendEmail(email, subject, html);

        console.log("✅ Email sent to:", email);

        res.status(200).json({ success: true, message: "Invite sent", invite });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const verifyInvite = async (req, res) => {
    const { token } = req.params;

    const invite = await Invite.findOne({ inviteToken: token });

    if (!invite || invite.expiresAt < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired invite" });
    }

    res.json({
        success: true,
        email: invite.email,
        workspaceId: invite.workspaceId,
        role: invite.role
    });
};

const registerWithInvite = async (req, res) => {
    const { name, contact, password, token } = req.body;

    const invite = await Invite.findOne({ inviteToken: token });

    if (!invite) return res.status(400).json({ message: "Invalid invite" });

    // Create user
    const user = await User.create({
        name,
        contact,
        email: invite.email,
        password: await encryptPassword(password)
    });

    const alreadyMember = await WorkspaceMember.findOne({
        workspaceId: invite.workspaceId,
        userId: user._id
    });

    if (alreadyMember) {
        return res.status(400).json({ message: "Already in workspace" });
    }

    // Add to workspace
    await WorkspaceMember.create({
        workspaceId: invite.workspaceId,
        userId: user._id,
        role: invite.role || "member"
    });

    invite.status = "accepted";
    await invite.save();

    res.json({ message: "Registered & joined workspace" });
};

const getReceivedInvites = async (req, res) => {
    try {
        const invites = await Invite.find({
            contact: req.user.contact
        }).populate("workspaceId").populate("invitedBy");

        res.status(200).json({ success: true, invites });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getSentInvites = async (req, res) => {
    try {
        const invites = await Invite.find({
            invitedBy: req.user.id
        }).populate("workspaceId").populate("invitedBy");

        res.status(200).json({ success: true, invites });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateInvite = async (req, res) => {
    const { inviteId, status } = req.params;

    const invite = await Invite.findById(inviteId);

    if (!invite) return res.status(404).json({ success: false, message: "Not found" });

    // Add to workspace
    await WorkspaceMember.create({
        workspaceId: invite.workspaceId,
        userId: req.user.id,
        inviteId: invite._id,
    });

    invite.status = status;
    await invite.save();

    res.json({ success: true, message: `${status} successfully` });
};

module.exports = {
    sendInvite,
    verifyInvite,
    registerWithInvite,
    getReceivedInvites,
    getSentInvites,
    updateInvite
};