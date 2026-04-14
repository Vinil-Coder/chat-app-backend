// socket.js

const socketIO = require("socket.io");
const cookieParser = require("cookie-parser");
const { verifyToken } = require("./utils/token-generator");

const Message = require("./models/message.model");
const Conversation = require("./models/conversation.model");

let io;
const onlineUsers = new Map();

/* ================= MIDDLEWARE ================= */

const wrap = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);

const socketAuth = (socket, next) => {
    try {
        const token = socket.request.cookies?.token;
        if (!token) return next(new Error("Unauthorized"));

        const decoded = verifyToken(token);
        socket.user = decoded;

        next();
    } catch (err) {
        console.error("Socket auth error:", err.message);
        next(new Error("Authentication failed"));
    }
};

/* ================= HELPERS ================= */

const getSocketId = (userId) => onlineUsers.get(userId.toString());

const isUserOnline = (userId) => onlineUsers.has(userId);

const emitToUser = (userId, event, payload) => {
    const socketId = getSocketId(userId);
    if (socketId) io.to(socketId).emit(event, payload);
};

const emitToUsers = (userIds, event, payload) => {
    userIds.forEach(uid => emitToUser(uid, event, payload));
};

/* ================= MESSAGE HELPERS ================= */

// Mark unread messages delivered when user comes online
const markUnreadMessagesDelivered = async (userId) => {

    const messages = await Message.find({
        receiverIds: userId,
        senderId: { $ne: userId },
        deliversTo: { $ne: userId }
    })

    const ids = messages.map(m => m._id);

    if (!ids.length) return [];

    const result = await Message.updateMany(
        { _id: { $in: ids } },
        {
            $addToSet: { deliversTo: userId },
            status: "delivered"
        }
    );

    if (result.modifiedCount === 0) return [];

    return messages;
};

// Mark messages as read
const markMessagesRead = async (conversationId, userId) => {

    const messages = await Message.find({
        conversationId,
        readBy: { $ne: userId }
    })

    const ids = messages.map(m => m._id);

    if (!ids.length) return [];

    const result = await Message.updateMany(
        { _id: { $in: ids } },
        {
            $addToSet: { readBy: userId },
            status: "read",
            isRead: true
        }
    );

    if (result.modifiedCount === 0) return [];

    return messages;
};

/* ================= EVENT HANDLERS ================= */

const handleJoinUser = async (socket) => {
    const userId = socket.user.id;

    socket.join(userId);
    onlineUsers.set(userId, socket.id);

    console.log("Online Users:", onlineUsers);

    const users = [...onlineUsers.keys()];

    onlineUsers.forEach((socketId) => {
        io.to(socketId).emit("user_online", users);
    });

    console.log('users emitted', users);

    const updatedMessages = await markUnreadMessagesDelivered(userId);

    const senderIds = [
        ...new Set(updatedMessages.map(msg => msg.senderId.toString()))
    ];

    emitToUsers(senderIds, "message_delivered", {
        ids: updatedMessages.map(m => m._id),
        userId
    });
};

const handleJoinConversation = async (socket, { conversationId }) => {
    const convo = await Conversation.findById(conversationId);
    if (!convo) return;

    if (!convo.participants.map(p => p.toString()).includes(socket.user.id)) {
        return;
    }

    socket.join(conversationId);
};

const handleSendMessage = async (message) => {

    // create message
    const newMessage = await Message.create({
        ...message,
        deliversTo: [],   // only online users
        readBy: []
    });

    // find online users only
    const onlineUsers = message.receiverIds.filter(userId => isUserOnline(userId));

    // emit only to online users
    emitToUsers(onlineUsers, "receive_message", newMessage);

    // update conversation
    await Conversation.findByIdAndUpdate(message.conversationId, {
        lastMessage: newMessage._id
    });
};

const handleDeliverMessage = async (socket, messageId) => {
    const userId = socket.user.id;

    const message = await Message.findById(messageId);

    // update message
    await Message.findByIdAndUpdate(
        messageId,
        {
            $addToSet: { deliversTo: userId },
            status: "delivered",
        }
    )

    emitToUser(message.senderId, "message_delivered", {
        ids: [message._id],
        userId
    });
};

const handleReadMessage = async (socket, conversationId) => {
    const userId = socket.user?.id;

    const updatedMessages = await markMessagesRead(conversationId, userId);

    const senderIds = [
        ...new Set(updatedMessages.map(msg => msg.receiverIds.map(id => id.toString())))
    ];

    emitToUsers(senderIds, "messages_read", {
        ids: updatedMessages.map(m => m._id),
        userId
    });
};

const handleTyping = async (socket, { conversationId, typing }) => {
    
    const convo = await Conversation.findById(conversationId);
    if (!convo) return;

    // Eliminating the current user who is typing
    const otherUsers = convo.participants
        .map(p => p.toString())
        .filter(id => id !== socket.user.id);

    emitToUsers(otherUsers, "is_typing", {
        conversationId,
        typing
    });
};

const handleDisconnect = (socket) => {
    const userId = socket.user?.id;

    if (userId) {
        onlineUsers.delete(userId);

        const users = [...onlineUsers.keys()];

        onlineUsers.forEach((socketId) => {
            io.to(socketId).emit("user_offline", users);
        });
    }

    console.log("Disconnected:", socket.id);
};

/* ================= INIT SOCKET ================= */

const initSocket = (server) => {

    io = socketIO(server, {
        cors: {
            origin: "http://localhost:4200",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ["websocket", "polling"]
    });

    io.use(wrap(cookieParser()));
    io.use(socketAuth);

    io.on("connection", (socket) => {

        console.log("Connected:", socket.id);

        socket.on("join_user", () => handleJoinUser(socket));

        socket.on("join_conversation", (data) =>
            handleJoinConversation(socket, data)
        );

        socket.on("send_message", (message) =>
            handleSendMessage(message)
        );

        socket.on("deliver_message", (messageId) =>
            handleDeliverMessage(socket, messageId)
        );

        socket.on("read_message", (data) =>
            handleReadMessage(socket, data)
        );

        socket.on("typing_starts", (conversationId) =>
            handleTyping(socket, { conversationId, typing: true })
        );

        socket.on("typing_stops", (conversationId) =>
            handleTyping(socket, { conversationId, typing: false })
        );

        socket.on("disconnect", () =>
            handleDisconnect(socket)
        );

    });
};

module.exports = { initSocket };