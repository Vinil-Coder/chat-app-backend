const {
    registerService,
    loginService,
    logoutService,
    changePasswordService
} = require("../services/auth.service");
const { verifyToken } = require("../utils/token-generator");

// REGISTER
const registerUser = async (req, res) => {
    try {
        await registerService(req.body);
        res.status(201).json({ message: "User registered successfully", success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

// LOGIN
const loginUser = async (req, res) => {
    try {

        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress ||
            req.ip;

        const result = await loginService({
            ...req.body,
            userAgent: req.headers["user-agent"],
            ip
        });

        res.cookie("token", result.token, {
            httpOnly: true,
            secure: false,        // true in production (HTTPS)
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000 // 2 days
        });

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({ message: "Login successful", success: true, user: result.user });

    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

// Auth Check API
const authCheckAPI = (req, res) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ authenticated: false });

    try {
        const decoded = verifyToken(token);
        res.json({ authenticated: true, user: decoded });
    } catch {
        res.status(500).json({ authenticated: false });
    }
}

// LOGOUT
const logoutUser = async (req, res) => {
    try {

        await logoutService({
            userId: req.user.id,
        });

        res.clearCookie("token");
        res.clearCookie("refreshToken");

        res.status(200).json({ message: "Logout successful", success: true });

    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
    try {

        await changePasswordService(req.body);

        res.status(200).json({ message: "Password changed successfully", success: true });

    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
};

module.exports = {
    registerUser,
    loginUser,
    authCheckAPI,
    logoutUser,
    changePassword
};