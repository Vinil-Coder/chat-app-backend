
const User = require("../models/user.model");
const Profile = require("../models/profile.model");
const Account = require("../models/account.model");
const Session = require("../models/session.model");

const { decryptyPassword, encryptPassword } = require("../utils/password-encrypted");

const { generateRefreshToken, generateToken } = require("../utils/token-generator");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists", sucess: false });

        const newUser = await User.create({ name, email, password: await encryptPassword(password) });

        await Profile.create({ user_id: newUser._id, fullName: newUser.name });

        await Account.create({ user_id: newUser._id });

        res.status(201).json({ message: "User registered successfully", sucess: true });

    } catch (error) {
        res.status(500).json({ error: error.message, sucess: false });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User does not exist", sucess: false });

        const passwordVerified = await decryptyPassword(password, user.password);
        if (!passwordVerified) return res.status(400).json({ message: "Invalid password", sucess: false });

        const token = generateToken({ id: user._id, name: user.name, email: user.email });
        const refreshToken = generateRefreshToken({ id: user._id, name: user.name, email: user.email });
        
        await Session.create(
            { 
                userID: user._id, 
                userAgent: req.headers["user-agent"], 
                refreshToken, 
                ipAddress: req.ip,
                device: req.headers["device"]
            });

        res.status(200).json({ token, refreshToken, user, sucess: true });

    } catch (error) {
        res.status(500).json({ error: error.message, sucess: false });
    }
}

const logutUser = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);
        if (!user) return res.status(400).json({ message: "User does not exist", sucess: false });

        await Session.updateMany(
            { userID: req.user.id }, 
            { isValid: false, logoutTime: new Date(), lastActiveAt: new Date(), expiresAt: new Date()});
        
        res.status(200).json({ message: "User logged out successfully", sucess: true });

    } catch (error) {
        res.status(500).json({ error: error.message, sucess: false });
    }
}

const changePassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User does not exist with that email", sucess: false });

        const isPasswordMatched = await decryptyPassword(password, user.password);
        if (isPasswordMatched) return res.status(400).json({ message: "New password cannot be same as old password", sucess: false });

        await User.findByIdAndUpdate(user._id, { password: await encryptPassword(password) });
        
        res.status(200).json({ message: "Password changed successfully", sucess: true });

    } catch (error) {
        res.status(500).json({ error: error.message, sucess: false });
    }
}

module.exports = { registerUser, loginUser, logutUser, changePassword };