const Conversation = require("../models/conversation.model");

const createConversationService = async (data, userId) => {
    const { type, receiverId } = data;

    // DIRECT CHAT
    if (type === "direct") {

        const existingConversation = await Conversation.findOne({
            type: "direct",
            participants: { $all: [userId, receiverId], $size: 2 }
        });

        // If already exists → return it
        if (existingConversation) {
            return existingConversation;
        }

        // Ensure participants are properly set
        data.participants = [userId, receiverId];
    }

    // GROUP CHAT
    if (type === "group") {
        // Ensure creator is part of group
        if (!data.participants.includes(userId)) {
            data.participants.push(userId);
        }
    }

    const conversation = await Conversation.create(data);

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