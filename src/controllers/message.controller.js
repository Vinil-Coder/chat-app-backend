const Message = require("../models/message.model");

const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    const message = await Message.create({
      conversationId,
      senderId: req.user.id,
      content
    });

    // Update last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id
    });

    res.status(201).json({ message });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { lastMessageId } = req.query;

  let query = { conversationId };

  if (lastMessageId) {
    const lastMsg = await Message.findById(lastMessageId);
    query.createdAt = { $lt: lastMsg.createdAt };
  }

  const messages = await Message.find(query)
    .limit(20);

  res.json(messages);
};

module.exports = {
  sendMessage,
  getMessages
};