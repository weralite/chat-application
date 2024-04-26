const Contact = require('../models/contact.model');
const Chat = require('../models/chat.model');
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

async function getAllContacts(req, res) {
  try {
    const contacts = await Contact.find()
      .populate({
        path: 'user1Id',
        select: '-password'
      })
      .populate({
        path: 'user2Id',
        select: '-password'
      });

    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving contacts: ' + error.message });
  }
}

async function getContact(req, res) {
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

    const filteredContacts = contacts.map(contact => {
      if (contact.blockedBy && contact.blockedBy.toString() !== userId) {
        return null; 
      }

      if (contact.user1Id._id.toString() === userId) {
        return {  _id: contact._id, contact: contact.user2Id, blockedBy: contact.blockedBy };
      } else {
        return {  _id: contact._id, contact: contact.user1Id, blockedBy: contact.blockedBy };
      }
    }).filter(contact => contact !== null);

    res.status(200).json(filteredContacts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving contacts: ' + error.message });
  }
}

async function deleteContact(req, res) {
  const { id } = req.params;

  try {
   const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
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
  getContact,
  getAllContacts,
  deleteContact,
  blockContact
};