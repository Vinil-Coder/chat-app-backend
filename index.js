const dotenv = require("dotenv");
dotenv.config();
const mongoConnection = require("./src/mongo.config");

const app = require("./src/app");

// Start the server and connect to MongoDB
app.listen(process.env.PORT || 5000, async () => {
    await mongoConnection();
    console.log(`Server is running on port ${process.env.PORT}`);
});