const { verifyToken } = require("../utils/token-generator");

const AuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Unauthorized User", success: false });

        const isTokenValid = verifyToken(token);
        if (!isTokenValid) return res.status(401).json({ message: "Token invalid/expired", success: false });

        const decodeToken = verifyToken(token);

        req.user = decodeToken;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message, success: false });
    }
}

module.exports = { AuthMiddleware };