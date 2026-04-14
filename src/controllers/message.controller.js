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

  res.status(200).json({ status: true, messages });
};

const getUnreadMessages = async (req, res) => {
  try {
    const unreadMessages = await Message.find(
      { receiverIds: { $in: [req.user.id] }, isRead: false },
    );

    const unreadCountMap = unreadMessages.reduce((acc, msg) => {
      const conversationId = msg.conversationId.toString();

      acc[conversationId] = {
        count: (acc[conversationId]?.count || 0) + 1,
        senderId: msg.senderId.toString(),
      };

      return acc;
    }, {});

    res.status(200).json({ status: true, unreadCountMap });

  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
}

module.exports = {
  getMessages,
  getUnreadMessages
};