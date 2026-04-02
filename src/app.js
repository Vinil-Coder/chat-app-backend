
const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);


module.exports = app;