const Message = require('../models/message.model');
const { Types: { ObjectId } } = require('mongoose');

async function getChatMessages(req, res) {
  const { chatId } = req.params;

  try {
    // Convert chatId to ObjectId
    const chatObjectId = new ObjectId(chatId);

    const messages = await Message.find({ chatId: chatObjectId, status: 'delivered' });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error getting messages: ' + error.message });
  }
}

async function deleteMessage(req, res) {
  try {
    const { id } = req.params;
    const message = await Message.deleteOne({
      _id:
        id
    });
    res.status(200).json(message);
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { getChatMessages, deleteMessage };