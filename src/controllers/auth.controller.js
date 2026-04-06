const {
    registerService,
    loginService,
    logoutService,
    changePasswordService
} = require("../services/auth.service");

// REGISTER
const registerUser = async (req, res) => {
    try {
        await registerService(req.body);
        res.status(201).json({ message: "User registered successfully", success: true });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
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

        res.status(200).json({ ...result, success: true });

    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
};

// LOGOUT
const logoutUser = async (req, res) => {
    try {

        await logoutService({
            userId: req.user.id,
            ...req.body
        });

        res.status(200).json({ message: "Logout successful", success: true });

    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
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
    logoutUser,
    changePassword
};