const express = require("express");
const { createGroup, getGroups, updateGroup, deleteGroup } = require("../controllers/group.controller");
const router = express.Router();

router.post("/", createGroup);
router.get("/", getGroups);
router.put("/id/:id", updateGroup);
router.delete("/id/:id", deleteGroup);

module.exports = router;