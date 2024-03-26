const Message = require('../models/message.model');
const Chat = require('../models/chat.model'); // Assuming you have a Chat model

async function getChatsForUser(userId) {
  // Find all chats where the senderId or receiverId is the user's id
  const chats = await Chat.find({
    $or: [
      { senderId: userId },
      { receiverId: userId }
    ]
  });
  return chats;
}

async function getLastMessageOfChat(chatId) {
  // Get the last message from the messages array
  const lastMessage = await Message.findOne({ chatId }).sort({ createdAt: -1 });
  return lastMessage;
}

module.exports = { getChatsForUser, getLastMessageOfChat };