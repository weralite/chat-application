const Contact = require('../models/contact.model');

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
    const userId = req.params.userId;

    try {
      const contacts = await Contact.find({ $or: [{ user1Id: userId }, { user2Id: userId }] });
      res.status(200).json(contacts);
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
    const contact = await Contact.findOne({ user1Id: user1Id, user2Id: user2Id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.blocked = true;
    await contact.save();

    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user: ' + error.message });
  }
};

module.exports = {
    createContact,
    getContactsForUser,
    deleteContact,
    blockContact
};