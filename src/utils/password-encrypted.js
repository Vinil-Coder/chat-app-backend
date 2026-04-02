const bcrypt = require("bcrypt");

const saltRounds = 10;

const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
};

const decryptyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = { encryptPassword, decryptyPassword };