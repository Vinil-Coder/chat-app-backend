const User = require("../models/user.model");
const Profile = require("../models/profile.model");
const Account = require("../models/account.model");
const { getUsersService } = require("../services/user.service");

const getUser = async (req, res) => {
  try {

    const user = await User.findOne(
      { _id: req.user.id },
      { password: 0, __v: 0 }
    )

    if (!user) return res.status(400).json({ success: false, message: "User not exists" });

    const profile = await Profile.findOne({ userId: user._id })
    const account = await Account.findOne({ userId: user._id })

    user.profile = profile
    user.account = account

    res.status(200).json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getRegisteredUsers = async (req, res) => {
  try {

    const users = await getUsersService(req.user.id);

    res.status(200).json({ success: true, users });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getUser,
  getRegisteredUsers
};