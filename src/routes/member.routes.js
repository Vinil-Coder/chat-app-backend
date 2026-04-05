const express = require("express");
const router = express.Router();

const { 
    getMembers, 
    getWorkspaceMembers,
    addMember, 
    updateMember, 
    removeMember 
} = require("../controllers/workspaceMember.controller");

router.get("/", getMembers);
router.get("/workspace/:workspaceId", getWorkspaceMembers);
router.post("/", addMember);
router.put("/:id", updateMember);
router.delete("/:id", removeMember);

module.exports = router;