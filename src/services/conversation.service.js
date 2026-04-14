const Conversation = require("../models/conversation.model");

const createConversationService = async (data, userId) => {
    const { type, participants } = data;

    // DIRECT CHAT
    if (type === "direct") {

        const existingConversation = await Conversation.findOne({
            type: type,
            participants: { $all: participants, $size: 2 }
        });

        // If already exists → return it
        if (existingConversation) {
            return existingConversation;
        }
    }

    // GROUP CHAT
    if (type === "group") {
        // Ensure creator is part of group
        if (!data.participants.includes(userId)) {
            data.participants.push(userId);
        }
    }

    const res = await Conversation.create(data);

    const conversation = await Conversation.findById(res._id)
        .populate("participants", "-password");

    return conversation;
};

const getConversationsService = async (userId) => {

    const conversations = await Conversation.find({
        participants: userId
    }).populate("participants", "-password -__v")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });


    return conversations;

}
module.exports = {
    createConversationService,
    getConversationsService
};