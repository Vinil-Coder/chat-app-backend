const User = require("../models/user.model");
const Profile = require("../models/profile.model");
const Account = require("../models/account.model");
const Session = require("../models/session.model");
const UAParser = require("ua-parser-js");

const { decryptyPassword, encryptPassword } = require("../utils/password-encrypted");
const { generateRefreshToken, generateToken } = require("../utils/token-generator");

// REGISTER
const registerService = async ({ name, email, contact, password }) => {

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists", success: false });

    const hashedPassword = await encryptPassword(password);

    const user = await User.create({
        name,
        email,
        contact,
        password: hashedPassword
    });

    await Profile.create({
        userId: user._id,
        fullName: user.name
    });

    await Account.create({
        userId: user._id
    });

    return user;
};

// LOGIN
const loginService = async ({ email, password, userAgent, ip }) => {

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not exists", success: false });

    const isValid = await decryptyPassword(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Invalid password", success: false });

    const parser = new UAParser(userAgent).getResult();

    const session = await Session.create({
        userId: user._id,
        userAgent,
        device: `${parser.browser.name} on ${parser.os.name}`,
        ipAddress: ip
    });

    const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        sessionId: session._id
    };

    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await Session.findByIdAndUpdate(session._id, { refreshToken });
    await User.findByIdAndUpdate(user._id, { isOnline: true });

    return { user, token, refreshToken, sessionId: session._id };
};

// LOGOUT
const logoutService = async ({ userId, logoutAll, sessionID }) => {

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not exists", success: false });

    const update = {
        isValid: false,
        logoutTime: new Date(),
        lastActiveAt: new Date(),
        expiresAt: new Date()
    };

    if (logoutAll) {
        await Session.updateMany({ userId }, update);
        await User.findByIdAndUpdate(user._id, { isOnline: false });
    } else {
        await Session.updateOne({ _id: sessionID }, update);
    }

    return true;
};

// CHANGE PASSWORD
const changePasswordService = async ({ email, password }) => {

    const user = await User.findOne(email);
    if (!user) return res.status(400).json({ message: "Email not exists", success: false });

    const isSame = await decryptyPassword(password, user.password);
    if (isSame) return res.status(400).json({ message: "New password cannot be same as old password", success: false });

    const hashed = await encryptPassword(password);

    await User.findByIdAndUpdate(user._id, { password: hashed });

    return true;
};

module.exports = {
    registerService,
    loginService,
    logoutService,
    changePasswordService
};