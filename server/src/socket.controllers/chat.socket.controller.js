const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const Contact = require('../models/contact.model');
const Message = require('../models/message.model');
const chatService = require('../socketHelpers/chatService');

module.exports = (io, emitToUser) => {
    io.on('connection', (socket) => {

        socket.on('get_chats', async ({ senderId, receiverId }) => {
            try {
                const contactPair = await chatService.getContactPair(senderId, receiverId);

                if (chatService.isBlocked(contactPair, senderId, receiverId)) {
                    return;
                }

                let chat = await chatService.getChat(senderId, receiverId);

                if (!chat) {
                    chat = await chatService.createChat(senderId, receiverId);
                }

                const chatWithUsernames = await chatService.prepareChatWithUsernames(chat, senderId, receiverId);

                socket.emit('receive_chats', chatWithUsernames);
            } catch (error) {
                console.error('Error fetching chats:', error);
                socket.emit('error', 'Failed to fetch chats');
            }
        });


        socket.on('get_all_chats', async ({ userId }) => {
            try {
                const chats = await Chat.find({
                    participants: userId
                });
                const chatObject = await Promise.all(chats.map(async (chat) => {
                    // Determine the other participants userID
                    const receiverId = chat.participants.find(participantId => participantId.toString() !== userId);

                    const contactPair = await Contact.findOne({
                        $or: [
                            { user1Id: userId, user2Id: receiverId },
                            { user1Id: receiverId, user2Id: userId }
                        ]
                    });

                    // If the user is blocked, don't return the chat
                    if (contactPair && contactPair.blockedBy) {
                        return null;
                    }

                    const receiver = await User.findById(receiverId);

                    let lastMessage = await Message.findOne({ chatId: chat._id }).sort({ createdAt: -1 });
                    // If lastMessage is null, log a message to the console instead of crashing app
                    if (!lastMessage) {
                        return null;
                    }

                    return {
                        ...chat._doc,
                        receiver: receiver ? receiver.username : null,
                        lastMessage
                    };
                }));
                const filteredChats = chatObject.filter(chat => chat !== null);

                socket.emit('chats', filteredChats);
            } catch (error) {
                console.error('Error fetching chats:', error);
                socket.emit('error', 'Failed to fetch chats');
            }
        });

        socket.on('delete_chat', async ({ chatId }) => {
            const chat = await Chat.findById(chatId);
            if (!chat) {
                console.error(`No chat found with ID: ${chatId}`);
                return;
            }
            const participants = chat.participants;
            await Chat.deleteOne({ _id: chatId });
            await Message.deleteMany({ chatId });

            participants.forEach(participant => {
                emitToUser(participant, 'chatDeleted', chatId);
            });
        });

    });
};
