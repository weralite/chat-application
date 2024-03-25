const Chat = require('../models/chat.model');
const generateChatId = require('../utils/generateChatID');

module.exports = (io) => {
    io.on('connection', (socket) => {
        // Fetch chats when a client requests
        socket.on('get_chats', async ({ senderId, receiverId }) => {
            try {
                const existingChat = await Chat.findOne({
                    participants: { $all: [senderId, receiverId] }
                });
                if (existingChat) {
                    // If the chat already exists, return it
                    console.log('Existing chat:', existingChat);
                    socket.emit('receive_chats', existingChat);
                } else {
                    // If the chat doesn't exist, create a new one
                    const chatId = generateChatId(senderId, receiverId);
                    const chat = new Chat({ participants: [senderId, receiverId], chatId });
                    await chat.save();
                    socket.emit('receive_chats', chat);
                }
            } catch (error) {
                console.error('Error fetching chats:', error);
                // Emit an error message to the client if something goes wrong
                socket.emit('error', 'Failed to fetch chats');
            }
        });
    });
};
