const Workspace = require("../models/workspace.model");
const WorkspaceMember = require("../models/workspaceMember.model");
const Conversation = require("../models/conversation.model");
const Invite = require("../models/invite.model");

const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const exists = await Workspace.findOne({
      createdBy: req.user.id,
      name
    });

    if (exists) {
      return res.status(400).json({ success: false, message: "Workspace already exists" });
    }

    const workspace = await Workspace.create({
      name,
      description,
      createdBy: req.user.id
    });

    // Add owner as admin member
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: req.user.id,
      role: "admin"
    });

    res.status(201).json({ success: true, workspace });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getWorkspaces = async (req, res) => {
  try {

    const memberships = await WorkspaceMember.find({
      userId: req.user.id
    }).populate("workspaceId");

    const workspaces = memberships.map(m => m.workspaceId);

    res.status(200).json({ success: true, workspaces });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findOne({
      _id: id,
      createdBy: req.user.id
    });

    if (!workspace) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const updated = await Workspace.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({ success: true, workspace: updated });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findOne({
      _id: id,
      createdBy: req.user.id
    });

    if (!workspace) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Workspace.findByIdAndDelete(id);

    // Cleanup
    await WorkspaceMember.deleteMany({ workspaceId: id });
    await Conversation.deleteMany({ workspaceId: id });

    res.status(200).json({ success: true, message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  updateWorkspace,
  deleteWorkspace
};