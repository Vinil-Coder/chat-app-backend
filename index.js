const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const mongoConnection = require("./src/mongo.config");
const app = require("./src/app");
const { initSocket } = require("./src/socket");

const server = http.createServer(app);

// initSocket(server);

server.listen(process.env.PORT || 5000, async () => {
    await mongoConnection();
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});