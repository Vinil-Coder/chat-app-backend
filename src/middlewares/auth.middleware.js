const { verifyToken } = require("../utils/token-generator");
const Session = require("../models/session.model");

const AuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) return res.status(401).json({ message: "Unauthorized User", success: false });

        const isTokenValid = verifyToken(token);
        if (!isTokenValid) return res.status(401).json({ message: "Token invalid/expired", success: false });

        const decodeToken = verifyToken(token);

        const session = await Session.findById(decodeToken.sessionID);
        if (!session) return res.status(401).json({ message: "Session not found", success: false });

        if (!session.isValid) return res.status(401).json({ message: "Session expired", success: false });

        req.user = decodeToken;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message, success: false });
    }
}

module.exports = { AuthMiddleware };