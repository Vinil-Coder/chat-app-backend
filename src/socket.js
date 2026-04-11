const socketIO = require("socket.io");
const Message = require("./models/message.model");
const Conversation = require("./models/conversation.model");
const cookieParser = require('cookie-parser');
const { verifyToken } = require("./utils/token-generator");

let io;

const onlineUsers = new Map();

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "http://localhost:4200",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ["websocket", "polling"]
    });

    const wrap = (middleware) => (socket, next) =>
        middleware(socket.request, {}, next);

    io.use(wrap(cookieParser()));

    io.use((socket, next) => {
        try {
            const cookies = socket.request.cookies;

            if (!cookies) {
                return next(new Error("No cookies found"));
            }

            const token = cookies.token;

            if (!token) {
                return next(new Error("Unauthorized"));
            }

            // Verify token
            const decoded = verifyToken(token);

            // Attach user to socket
            socket.user = decoded;

            next();

        } catch (err) {
            console.error("Socket auth error:", err.message);
            next(new Error("Authentication failed"));
        }
    });

    io.on("connection", (socket) => {

        console.log("Connected:", socket.id);

        onlineUsers.set(socket.user.id, socket.id);

        /* ================= JOIN CONVERSATION ================= */
        socket.on("join_conversation", async ({ conversationId }) => {

            const convo = await Conversation.findById(conversationId);

            if (!convo.participants.includes(socket.user.id)) return; // SECURITY

            socket.join(conversationId);
        });

        /* ================= SEND MESSAGE ================= */
        socket.on("send_message", async (message) => {

            const res = await Message.create({
                ...message,
                deliveredTo: [],
                readBy: []
            });

            await Conversation.findByIdAndUpdate(message.conversationId, {
                lastMessage: res._id
            });

            io.to(message.conversationId).emit("receive_message", res);
        });

        /* ================= ON MESSAGE DELIVERED ================= */
        socket.on("message_delivered", async ({ messageId, userId }) => {
            await Message.findByIdAndUpdate(messageId, {
                $addToSet: { deliveredTo: userId }
            });
        });

        /* ================= ON MESSAGE READ ================= */
        socket.on("mark_read", async ({ conversationId, userId }) => {

            const messages = await Message.find({
                conversationId,
                senderId: { $ne: userId }
            });

            const ids = messages.map(m => m._id);

            await Message.updateMany(
                { _id: { $in: ids } },
                { $addToSet: { readBy: userId } }
            );

            io.to(conversationId).emit("messages_read", {
                conversationId,
                userId
            });
        });

        /* ================= TYPING START ================= */
        socket.on("typing_starts", async ({ conversationId }) => {

            const convo = await Conversation.findById(conversationId);

            const otherUsers = convo.participants
                .map(p => p.toString())
                .filter(id => id !== socket.user.id);

            otherUsers.forEach((uid) => {
                const socketId = onlineUsers.get(uid);

                if (socketId) {
                    io.to(socketId).emit("is_typing", {
                        conversationId,
                        userId: socket.user.id,
                        typing: true
                    });
                }
            });
        });

        /* ================= TYPING STOP ================= */
        socket.on("typing_stops", async ({ conversationId }) => {

            const convo = await Conversation.findById(conversationId);

            const otherUsers = convo.participants
                .map(p => p.toString())
                .filter(id => id !== socket.user.id);

            otherUsers.forEach((uid) => {
                const socketId = onlineUsers.get(uid);

                if (socketId) {
                    io.to(socketId).emit("is_typing", {
                        conversationId,
                        userId: socket.user.id,
                        typing: false
                    });
                }
            });
        });

        /* ================= DISCONNECT ================= */
        socket.on("disconnect", () => {

            if (socket.user.id) {
                onlineUsers.delete(socket.user.id);
                io.emit("user_offline", socket.user.id);
            }

            console.log("Disconnected:", socket.id);
        });

    });
};

module.exports = { initSocket };