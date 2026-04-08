const Group = require("../models/group.model");
const Conversation = require("../models/conversation.model");

const createGroupService = async (userId, data) => {
  const { name, description } = data;

  const exists = await Group.findOne({
    createdBy: userId,
    name
  });

  if (exists) {
    throw new Error("Group already exists");
  }

  const group = await Group.create({
    name,
    description,
    createdBy: userId,
    members: [userId, ...data.members],
    admins: [userId]
  });

  // Default group conversation
  await Conversation.create({
    type: "group",
    name: group.name,
    groupId: group._id,
    participants: [userId, ...data.members]
  });

  return group;
};


const getGroupsService = async (userId) => {
  const groups = await Group.find({
    members: { $in: [userId] }
  }).populate("members", "-password -__v");

  return groups
};


const updateGroupService = async (userId, groupId, data) => {
  const isExists = await Group.findOne({
    _id: groupId,
    createdBy: userId
  });

  if (!isExists) {
    throw new Error("Not authorized");
  }

  const group = await Group.findByIdAndUpdate(
    groupId,
    data,
    { new: true }
  );

  // Update conversation
  await Conversation.updateOne(
    { groupId },
    { name: group.name, participants: group.members }
  );

  return group;
};


const deleteGroupService = async (userId, groupId) => {
  const group = await Group.findOne({
    _id: groupId,
    createdBy: userId
  });

  if (!group) {
    throw new Error("Not authorized");
  }

  await Group.findByIdAndDelete(groupId);

  // Cleanup
  await Conversation.deleteOne({ groupId });

  return true;
};


module.exports = {
  createGroupService,
  getGroupsService,
  updateGroupService,
  deleteGroupService
};