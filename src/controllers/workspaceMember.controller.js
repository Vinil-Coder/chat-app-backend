
const WorkspaceMember = require("../models/workspaceMember.model");
const Workspace = require("../models/workspace.model");

// Helper: Check if user is admin
const isAdmin = async (workspaceId, userId) => {
  const member = await WorkspaceMember.findOne({
    workspaceId,
    userId,
    role: "admin"
  });
  return !!member;
};


// Add Member
const addMember = async (req, res) => {
  try {
    const { workspaceId, userId } = req.body;

    // Check admin
    const admin = await isAdmin(workspaceId, req.user.id);
    if (!admin) {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    const exists = await WorkspaceMember.findOne({ workspaceId, userId });
    if (exists) {
      return res.status(400).json({ message: "Already a member" });
    }

    await WorkspaceMember.create({
      workspaceId,
      userId,
      role: "member"
    });

    res.status(201).json({ message: "Member added successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Workspace Members
const getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    // Check if user is part of workspace
    const isMember = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.user.id
    });

    if (!isMember) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const members = await WorkspaceMember.find({ workspaceId })
      .populate("userId", "name email") // fetch user details
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, members });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Members
const getMembers = async (req, res) => {
  try {

    const workspaces = await Workspace.find({ createdBy: req.user.id });

    const members = await WorkspaceMember.find({
      workspaceId: { $in: workspaces.map(w => w._id) },
      role: "member"
    }).populate("userId", "name email contact") // fetch user details
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, members });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Member Role
const updateMember = async (req, res) => {
  try {
    const { id } = req.params; // workspaceMemberId
    const { role } = req.body;

    const member = await WorkspaceMember.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Check admin
    const admin = await isAdmin(member.workspaceId, req.user.id);
    if (!admin) {
      return res.status(403).json({ message: "Only admins can update roles" });
    }

    member.role = role;
    await member.save();

    res.status(200).json({ message: "Member updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Remove Member
const removeMember = async (req, res) => {
  try {
    const { id } = req.params; // workspaceMemberId

    const member = await WorkspaceMember.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Check admin OR self-remove
    const admin = await isAdmin(member.workspaceId, req.user.id);

    if (!admin && member.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await WorkspaceMember.findByIdAndDelete(id);

    res.status(200).json({ message: "Member removed successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  addMember,
  getMembers,
  getWorkspaceMembers,
  updateMember,
  removeMember
};