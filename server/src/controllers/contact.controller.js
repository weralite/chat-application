const Contact = require('../models/contact.model');
const Chat = require('../models/chat.model');

async function createContact(req, res) {
  const { user1Id, user2Id } = req.body;

  try {
    const newContact = new Contact({ user1Id, user2Id });

    const existingContact = await Contact.findOne({ $or: [{ user1Id, user2Id }, { user1Id: user2Id, user2Id: user1Id }] });
    if (existingContact) {
      return res.status(400).json({ message: 'Contact already exists.' });
    }

    // check if user1Id and user2Id is the same
    if (user1Id.toString() === user2Id.toString()) {
      return res.status(405).json({ message: 'Cannot add self as contact.' });
    }

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
        return { _id: contact._id, contact: contact.user2Id, blockedBy: contact.blockedBy };
      } else {
        return { _id: contact._id, contact: contact.user1Id, blockedBy: contact.blockedBy };
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
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    const { user1Id, user2Id } = contact;

    const chat = await Chat.findOne({
      participants: { $all: [user1Id, user2Id] }
    });

    if (chat) {
      await Chat.findByIdAndDelete(chat._id);
    }
    await Contact.findByIdAndDelete(id);

    res.status(200).json({ message: 'Contact and associated chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact: ' + error.message });
  }
}




module.exports = {
  createContact,
  getContact,
  getAllContacts,
  deleteContact,
};