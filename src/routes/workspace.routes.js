const express = require("express");
const router = express.Router();
const { createWorkspace, getWorkspaces, updateWorkspace, deleteWorkspace } = require("../controllers/workspace.controller");

router.post("/", createWorkspace);
router.get("/", getWorkspaces);
router.put("/id/:id", updateWorkspace);
router.delete("/id/:id", deleteWorkspace);

module.exports = router;