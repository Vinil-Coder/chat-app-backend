
const Session = require("../models/session.model");

const userSessions = async (req, res) => {
    try {

        const sessions = await Session.find({ userId: req.user.id, isValid: true });

        res.status(200).json({ message: "Sessions fetched successfully", sucess: true, sessions });

    } catch (error) {
        res.status(500).json({ error: error.message, sucess: false });
    }
}

const createSession = async (userId, token, device, ip) => {
  return await Session.create({
    userId,
    token,
    device,
    ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
};

module.exports = { userSessions, createSession };