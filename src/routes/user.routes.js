const express = require("express");
const router = express.Router();
const { getRegisteredUsers, getUser } = require("../controllers/user.controller");

router.get("/", getUser);
router.get("/registered-users", getRegisteredUsers);

module.exports = router;