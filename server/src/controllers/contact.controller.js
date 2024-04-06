const Contact = require('../models/contact.model');
const User = require('../models/user.model');


async function createContact(req, res) {
  const { user1Id, user2Id } = req.body;

  try {
    const newContact = new Contact({ user1Id, user2Id });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contact: ' + error.message });
  }
};


async function getContactsForUser(req, res) {
  const userId = req.query.userId;

  try {
    const contacts = await Contact.find({ $or: [{ user1Id: userId }, { user2Id: userId }] });
    const otherUsers = await Promise.all(
      contacts.map(async contact => {
        const otherUserId = contact.user1Id.toString() === userId ? contact.user2Id : contact.user1Id;
        const user = await User.findById(otherUserId);
        return { id: user._id, username: user.username, blocked: contact.blocked };
      })
    );

    res.status(200).json(otherUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving contacts: ' + error.message });
  }
};

async function deleteContact(req, res) {
  const contactId = req.params.contactId;

  try {
    await Contact.findByIdAndDelete(contactId);
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact: ' + error.message });
  }
};

async function blockContact(req, res) {
  const { user1Id, user2Id } = req.body;

  try {
    // Find the contact based on the user IDs
    const contact = await Contact.findOne({ user1Id, user2Id });

    // If contact doesn't exist, return 404
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Determine which user initiated the block
    if (contact.user1Id.equals(user1Id)) {
      // User1 blocked User2
      contact.blockedByUser1 = true;
    } else {
      // User2 blocked User1
      contact.blockedByUser2 = true;
    }

    // Save the updated contact
    await contact.save();

    // Respond with success message
    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: 'Error blocking user: ' + error.message });
  }
};

async function unBlockContact(req, res) {
  const { user1Id, user2Id } = req.body;

  try {
    // Find the contact based on the user IDs
    const contact = await Contact.findOne({ user1Id, user2Id });

    // If contact doesn't exist, return 404
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Determine which user initiated the block
    if (contact.user1Id.equals(user1Id)) {
      // User1 blocked User2
      contact.blockedByUser1 = false;
    } else {
      // User2 blocked User1
      contact.blockedByUser2 = false;
    }

    // Save the updated contact
    await contact.save();

    // Respond with success message
    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: 'Error unblocking user: ' + error.message });
  }
};



module.exports = {
  unBlockContact,
  createContact,
  getContactsForUser,
  deleteContact,
  blockContact
};