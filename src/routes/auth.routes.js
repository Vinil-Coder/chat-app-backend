const express = require("express");
const router = express.Router();
const { registerUser, loginUser, authCheckAPI, logoutUser, changePassword } = require("../controllers/auth.controller");
const { AuthMiddleware } = require("../middlewares/auth.middleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", AuthMiddleware, logoutUser);
router.put("/change-password", changePassword);
router.get("/me", AuthMiddleware, authCheckAPI)

module.exports = router;