const Message = require("../models/message.model");

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
  getMessages
};