const express = require("express");
const router = express.Router();
const { userSessions } = require("../controllers/session.controller");
const { AuthMiddleware } = require("../middlewares/auth.middleware");

router.get("/", AuthMiddleware, userSessions);

module.exports = router;