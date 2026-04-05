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

module.exports = {
  createGroupConversation
};