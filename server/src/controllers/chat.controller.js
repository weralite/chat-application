const Chat = require('../models/chat.model');

// Create a new chat
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
      // If the chat does not exist, create a new chat
      const chat = new Chat({ participants: [senderId, receiverId]});
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