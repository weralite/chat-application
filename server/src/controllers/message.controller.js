const Message = require('../models/message.model');
const Chat = require('../models/chat.model');

async function createMessage(req, res) {
    const { senderId, receiverId, content } = req.body;
  
    try {
      const chat = await Chat.findOne({ participants: { $all: [senderId, receiverId] } });
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content: content,
        chatID: chat.chatId,
      });
  
      await newMessage.save();
  
      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ message: 'Error sending message: ' + error.message });
    }
  }


  async function getChatMessages (req, res) {
    const { chatId } = req.params;

    try {
      const messages = await Message.find({ chatId });
  
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error getting messages: ' + error.message });
    }
  };

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

module.exports = { createMessage, getChatMessages, deleteMessage };