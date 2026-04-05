const express = require("express");
const router = express.Router();

const { AuthMiddleware } = require("../middlewares/auth.middleware");

const {
    sendInvite, 
    verifyInvite, 
    registerWithInvite, 
    updateInvite, 
    getReceivedInvites,
    getSentInvites
} = require("../controllers/invite.controller");

router.post("/sendInvite",  AuthMiddleware, sendInvite);
router.get("/verify/:token", verifyInvite);
router.post("/register", registerWithInvite);

router.get("/received", AuthMiddleware, getReceivedInvites);
router.get("/sent", AuthMiddleware, getSentInvites);

router.get("/:inviteId/:status", AuthMiddleware, updateInvite);

module.exports = router;