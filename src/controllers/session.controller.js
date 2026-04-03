
const Session = require("../models/session.model");

const userSessions = async (req, res) => {
    try {

        const sessions = await Session.find({ userID: req.user.id, isValid: true });

        res.status(200).json({ message: "Sessions fetched successfully", sucess: true, sessions });

    } catch (error) {
        res.status(500).json({ error: error.message, sucess: false });
    }
}

module.exports = { userSessions };