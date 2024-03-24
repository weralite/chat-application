const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const generateChatId = require('../utils/generateChatID');


async function createChat(req, res) {
  const { senderId, receiverId } = req.body;

  try {
    // Check if a chat with the same participants already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (existingChat) {
      // If the chat already exists, return it
      res.status(200).json(existingChat);
    } else {
      // If the chat doesn't exist, create a new one
      const chatId = generateChatId(senderId, receiverId);
      const chat = new Chat({ participants: [senderId, receiverId], chatId });

      await chat.save();

      res.status(201).json(chat);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat: ' + error.message });
  }
};

module.exports = {
  createChat,
};