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


async function getContacts(req, res) {
  const userId = req.query.userId;

  try {
    if (!userId) {
      return res.status(404).json({ message: 'Error retrieving contacts, userId missing.' });
    }

    const contacts = await Contact.find({ $or: [{ user1Id: userId }, { user2Id: userId }] })
      .populate({
        path: 'user1Id',
        select: '-password'
      })
      .populate({
        path: 'user2Id',
        select: '-password'
      });

    // Filter out contacts where user1Id or user2Id matches the userId
    const filteredContacts = contacts.map(contact => {
      if (contact.user1Id._id.toString() === userId) {
        return contact.user2Id;
      } else {
        return contact.user1Id;
      }
    });

    res.status(200).json(filteredContacts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving contacts: ' + error.message });
  }
}

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
  const { contactId, userId } = req.body;

  try {
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (contact.blockedBy && contact.blockedBy.includes(userId)) {
      return res.status(400).json({ message: 'Contact is already blocked' });
    }

    contact.blockedBy = contact.blockedBy ? [...contact.blockedBy, userId] : [userId];
    await contact.save();

    res.status(200).json({ message: 'Contact blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking contact: ' + error.message });
  }
}
async function unBlockContact(req, res) {
  const { contactId } = req.body;

  try {
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    contact.blockedBy = undefined; // Removes blockedBy entry

    await contact.save();

    res.status(200).json({ message: 'Contact unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking contact: ' + error.message });
  }
}


module.exports = {
  unBlockContact,
  createContact,
  getContacts,
  deleteContact,
  blockContact
};