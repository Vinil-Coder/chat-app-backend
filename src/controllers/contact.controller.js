const Contact = require("../models/contact.model");

const sendInvite = async (req, res) => {
  try {
    const { contactUserId } = req.body;

    const exists = await Contact.findOne({
      userId: req.user.id,
      contactUserId
    });

    if (exists) {
      return res.status(400).json({ message: "Already invited" });
    }

    await Contact.create({
      userId: req.user.id,
      contactUserId,
      status: "pending"
    });

    res.status(200).json({ message: "Invite sent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findById(contactId);

    if (!contact) return res.status(404).json({ message: "Not found" });

    contact.status = "accepted";
    await contact.save();

    // Create direct conversation
    await Conversation.create({
      type: "direct",
      members: [contact.userId, contact.contactUserId]
    });

    res.status(200).json({ message: "Accepted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  sendInvite,
  acceptInvite
};