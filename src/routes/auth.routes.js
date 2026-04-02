const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logutUser, changePassword } = require("../controllers/auth.controller");
const { AuthMiddleware } = require("../middlewares/auth.middleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", AuthMiddleware, logutUser);
router.put("/change-password", changePassword);

module.exports = router;