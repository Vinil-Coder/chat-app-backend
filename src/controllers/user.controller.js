const User = require("../models/user.model");

const getUser = async (req, res) => {
  try {

    const user = await User.findOne(
      { _id: req.user.id},
      { password: 0, __v: 0 }
    )

    if (!user) {
      return res.status(400).json({ success: false, message: "User not exists" });
    }

    res.status(200).json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getUser
};