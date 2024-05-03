const Message = require('../models/message.model');
const { Types: { ObjectId } } = require('mongoose');


// Used for counting messages with status delivered in the client chatlist
async function getChatMessages(req, res) {
  const { chatId } = req.params;

  try {
    const chatObjectId = new ObjectId(chatId);
    const messages = await Message.find({ chatId: chatObjectId, status: 'delivered' });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error getting messages: ' + error.message });
  }
}

module.exports = { getChatMessages };