const { verifyToken } = require("../utils/token-generator");

const AuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) return res.status(401).json({ message: "Unauthorized User", sucess: false });

        const isTokenValid = verifyToken(token);
        if (!isTokenValid) return res.status(401).json({ message: "Token invalid/expired", sucess: false });

        const decodeToken = verifyToken(token);
        req.user = decodeToken;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message, sucess: false });
    }
}

module.exports = { AuthMiddleware };