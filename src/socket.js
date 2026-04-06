const socketIO = require("socket.io");
const Message = require("./models/message.model");
const Conversation = require("./models/conversation.model");

let io;

const onlineUsers = new Map();

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "http://localhost:4200", // Angular app
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ["websocket", "polling"]
    });

    io.on("connection", (socket) => {

        console.log("Connected:", socket.id);

        /* ================= USER JOIN ================= */
        socket.on("join_user", (userId) => {
            console.log("join_user event", userId);
            socket.userId = userId;

            onlineUsers.set(userId, socket.id);
            socket.join(userId);

            console.log("Online users:", onlineUsers);

            io.emit("user_online", userId);
        });

        /* ================= JOIN CONVERSATION ================= */
        socket.on("join_conversation", async ({ conversationId, userId }) => {

            const convo = await Conversation.findById(conversationId);

            if (!convo.members.includes(userId)) return; // SECURITY

            socket.join(conversationId);
        });

        /* ================= SEND MESSAGE ================= */
        socket.on("send_message", async (data) => {

            console.log('send_message event data', data);

            const { senderId, receiverId, conversationId, content } = data;

            let convo;

            /* ===== DIRECT CHAT ===== */
            if (receiverId) {

                convo = await Conversation.findOne({
                    type: "direct",
                    members: { $all: [senderId, receiverId], $size: 2 }
                });

                if (!convo) {
                    convo = await Conversation.create({
                        type: "direct",
                        members: [senderId, receiverId]
                    });
                }

            }

            /* ===== GROUP CHAT ===== */
            if (conversationId) {
                convo = await Conversation.findById(conversationId);
            }

            const message = await Message.create({
                conversationId: convo._id,
                senderId,
                content,
                deliveredTo: [senderId]
            });

            io.to(convo._id.toString()).emit("receive_message", message);

            await Conversation.findByIdAndUpdate(convo._id, {
                lastMessage: message._id
            });
        });

        /* ================= MESSAGE DELIVERED ================= */
        socket.on("message_delivered", async ({ messageId, userId }) => {

            await Message.findByIdAndUpdate(messageId, {
                $addToSet: { deliveredTo: userId }
            });

            const msg = await Message.findById(messageId);

            io.to(msg.conversationId).emit("message_delivered", {
                messageId,
                userId
            });
        });

        /* ================= MESSAGE READ ================= */
        socket.on("message_read", async ({ messageId, userId }) => {

            await Message.findByIdAndUpdate(messageId, {
                $addToSet: { readBy: userId }
            });

            const msg = await Message.findById(messageId);

            io.to(msg.conversationId).emit("message_read", {
                messageId,
                userId
            });
        });

        /* ================= TYPING ================= */
        socket.on("typing", ({ conversationId, userId }) => {
            console.log("typing event", { conversationId, userId });
            socket.to(conversationId).emit("typing", { userId });
        });

        socket.on("stop_typing", ({ conversationId, userId }) => {
            socket.to(conversationId).emit("stop_typing", { userId });
        });

        /* ================= DISCONNECT ================= */
        socket.on("disconnect", () => {

            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                io.emit("user_offline", socket.userId);
            }

            console.log("Disconnected:", socket.id);
        });

    });
};

module.exports = { initSocket };