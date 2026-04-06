const express = require("express");
const router = express.Router();
const { getUserChats } = require("../controllers/conversation.controller");
const { getMessages } = require("../controllers/message.controller");

router.get("/conversations", getUserChats);
router.get("/messages/:conversationId", getMessages);

module.exports = router;