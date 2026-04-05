// socket.js
const socketIO = require("socket.io");

const Message = require("./models/message.model");

let io;

const initSocket = (server) => {
    io = socketIO(server, {
        cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Join user personal room
        socket.on("join_user", (userId) => {
            socket.join(userId);
        });

        // Join conversation room
        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
        });

        // Send message
        socket.on("send_message", async (data) => {
            const { conversationId, senderId, content } = data;

            const message = await Message.create({
                conversationId,
                senderId,
                content
            });

            // Emit to all members in that conversation
            io.to(conversationId).emit("receive_message", message);
        });

        socket.on("typing", ({ conversationId, userId }) => {
            socket.to(conversationId).emit("typing", { userId });
        });

        socket.on("stop_typing", ({ conversationId, userId }) => {
            socket.to(conversationId).emit("stop_typing", { userId });
        });

        const onlineUsers = new Map();

        socket.on("join_user", (userId) => {
            onlineUsers.set(userId, socket.id);
        });

        socket.on("message_read", async ({ messageId, userId }) => {

            await Message.findByIdAndUpdate(messageId, {
                $addToSet: { readBy: userId }
            });

            io.to(message.conversationId).emit("message_read", {
                messageId,
                userId
            });
        });

        socket.on("disconnect", () => {
            for (let [userId, sockId] of onlineUsers.entries()) {
                if (sockId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
        });
    });
};

const getIO = () => io;

module.exports = { initSocket, getIO };