
const { 
  createGroupService,
  getGroupsService,
  updateGroupService,
  deleteGroupService
} = require("../services/group.service");

const createGroup = async (req, res) => {
  try {
    const group = await createGroupService(
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      group
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


const getGroups = async (req, res) => {
  try {
    const groups = await getGroupsService(
      req.user.id
    );

    res.status(200).json({
      success: true,
      groups
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


const updateGroup = async (req, res) => {
  try {
    const group = await updateGroupService(
      req.user.id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      group
    });

  } catch (err) {
    res.status(403).json({
      success: false,
      message: err.message
    });
  }
};


const deleteGroup = async (req, res) => {
  try {
    await deleteGroupService(
      req.user.id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Deleted successfully"
    });

  } catch (err) {
    res.status(403).json({
      success: false,
      message: err.message
    });
  }
};


module.exports = {
  createGroup,
  getGroups,
  updateGroup,
  deleteGroup
};