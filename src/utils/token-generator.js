const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generateToken = (signedData) => {
    return jwt.sign(signedData, process.env.SECRET_KEY, { expiresIn: "2d" });
}

const generateRefreshToken = (signedData) => {
    return jwt.sign(signedData, process.env.REFRESH_SECRET_KEY)
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.SECRET_KEY)
}

module.exports = { generateToken, generateRefreshToken, verifyToken };