const {
  createConversationService,
  getConversationsService
} = require("../services/conversation.service");

const createConversation = async (req, res) => {
  try {
    const conversation = await createConversationService(req.body, req.user.id);

    res.status(201).json({ success: true, conversation });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getConversations = async (req, res) => {

  try {
    const conversations = await getConversationsService(req.user.id);

    res.status(200).json({ success: true, conversations });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  createConversation,
  getConversations
};