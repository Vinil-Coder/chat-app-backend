const express = require("express");
const router = express.Router();
const { getConversations, createConversation } = require("../controllers/conversation.controller");
const { getMessages } = require("../controllers/message.controller");

router.post("/", createConversation);
router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);

module.exports = router;