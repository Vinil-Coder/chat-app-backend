const Conversation = require("../models/conversation.model");

const createGroupConversation = async (req, res) => {
  try {
    const { name, members, workspaceId } = req.body;

    const conversation = await Conversation.create({
      type: "group",
      members,
      workspaceId,
      name
    });

    res.status(201).json({ conversation });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserChats = async (req, res) => {

    const userId = req.user.id;

    const conversations = await Conversation.find({
        members: userId
    })
    .populate("members", "name email")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

    res.json(conversations);
};

module.exports = {
  createGroupConversation,
  getUserChats
};