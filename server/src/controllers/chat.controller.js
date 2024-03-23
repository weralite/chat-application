const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const generateChatId = require('../utils/generateChatID');


async function createChat(req, res) {
    const { senderId, receiverId } = req.body;

    try {
      const chatId = generateChatId(senderId, receiverId);
      const chat = new Chat({ participants: [senderId, receiverId], chatId });
  
      await chat.save();
  
      res.status(201).json(chat);
    } catch (error) {
      res.status(500).json({ message: 'Error creating chat: ' + error.message });
    }
  };



  module.exports = {
    createChat,
  };