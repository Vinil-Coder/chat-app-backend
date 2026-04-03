const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, changePassword } = require("../controllers/auth.controller");
const { AuthMiddleware } = require("../middlewares/auth.middleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/logout", AuthMiddleware, logoutUser);
router.put("/change-password", changePassword);

module.exports = router;