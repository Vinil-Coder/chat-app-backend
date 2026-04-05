const express = require("express");
const router = express.Router();
const { userSessions } = require("../controllers/session.controller");

router.get("/", userSessions);

module.exports = router;