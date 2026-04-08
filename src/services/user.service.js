
const User = require("../models/user.model");

const getUsersService = async (userId) => {

    const users = await User.find(
        { _id: { $ne: userId } },
        { password: 0, __v: 0 }
    );

    return users;
};

module.exports = {
    getUsersService,
};