
const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
const authRoutes = require("./routes/auth.routes");
const groupRoutes = require("./routes/group.routes");
const inviteRoutes = require("./routes/invite.routes");
const UserRoutes = require("./routes/user.routes");
const ChatRoutes = require("./routes/conversation.routes");

const { AuthMiddleware } = require("./middlewares/auth.middleware");

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", AuthMiddleware, ChatRoutes);
app.use("/api/groups", AuthMiddleware, groupRoutes);
app.use("/api/invite", AuthMiddleware, inviteRoutes);
app.use("/api/user", AuthMiddleware, UserRoutes);

module.exports = app;