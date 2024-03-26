const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const generateChatId = require('../utils/generateChatID');
const { getChatsForUser, getLastMessageOfChat } = require('../utils/chat.utils');


module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('get_chats', async ({ senderId, receiverId }) => {
            try {
                let chat = await Chat.findOne({
                    participants: { $all: [senderId, receiverId] }
                });

                if (!chat) {
                    const chatId = generateChatId(senderId, receiverId);
                    chat = new Chat({ participants: [senderId, receiverId], chatId });
                    await chat.save();
                }

                const [sender, receiver] = await Promise.all([
                    User.findById(senderId),
                    User.findById(receiverId)
                ]);

                const chatWithUsernames = {
                    ...chat._doc,
                    senderUsername: sender ? sender.username : null,
                    receiverUsername: receiver ? receiver.username : null
                };

                socket.emit('receive_chats', chatWithUsernames);
            } catch (error) {
                console.error('Error fetching chats:', error);
                socket.emit('error', 'Failed to fetch chats');
            }
        });
        socket.on('get_all_chats', async ({ userId }) => {
            try {
              const chats = await Chat.find({
                participants: { $in: [userId] }
              });
          
              const chatsWithUsernamesAndLastMessage = await Promise.all(chats.map(async (chat) => {
                const otherUserId = chat.participants.find(id => id !== userId);
                const otherUser = await User.findById(otherUserId);
                const lastMessage = await getLastMessageOfChat(chat.chatId);
          
                return {
                  ...chat._doc,
                  otherUsername: otherUser ? otherUser.username : null,
                  lastMessage
                };
              }));
          
              console.log('chatsWithUsernamesAndLastMessage', chatsWithUsernamesAndLastMessage);
              socket.emit('chats', chatsWithUsernamesAndLastMessage);
            } catch (error) {
              console.error('Error fetching chats:', error);
              socket.emit('error', 'Failed to fetch chats');
            }
          });

    });
};
