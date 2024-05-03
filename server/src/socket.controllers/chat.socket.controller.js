const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const Message = require('../models/message.model');
const Contact = require('../models/contact.model');

module.exports = (io, emitToUser) => {
    io.on('connection', (socket) => {

        socket.on('get_chats', async ({ senderId, receiverId }) => {
            try {
                const contactPair = await Contact.findOne({
                    $or: [
                        { user1Id: senderId, user2Id: receiverId },
                        { user1Id: receiverId, user2Id: senderId }
                    ]
                });

                // If either user has blocked the other, don't return the chatroom
                if (contactPair && contactPair.blockedBy && (contactPair.blockedBy.toString() === senderId || contactPair.blockedBy.toString() === receiverId)) {
                    return;
                }
                // Find a chat where both sender and receiver are participants
                let chat = await Chat.findOne({
                    participants: { $all: [senderId, receiverId] }
                });

                if (!chat) {
                    // Create a new chat with participants
                    chat = new Chat({ participants: [senderId, receiverId] });
                    await chat.save();
                }
                const [sender, receiver] = await Promise.all([
                    User.findById(senderId),
                    User.findById(receiverId)
                ]);
                // Prepare chat object with sender and receiver usernames
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
                    participants: userId
                });
                const chatsWithUsernamesAndLastMessage = await Promise.all(chats.map(async (chat) => {
                    // Determine the other participants userID
                    const otherUserId = chat.participants.find(participantId => participantId.toString() !== userId);

                    const contactPair = await Contact.findOne({
                        $or: [
                            { user1Id: userId, user2Id: otherUserId },
                            { user1Id: otherUserId, user2Id: userId }
                        ]
                    });

                    // If the user is blocked, don't return the chat
                    if (contactPair && contactPair.blockedBy) {
                        return null;
                    }

                    const otherUser = await User.findById(otherUserId);

                    let lastMessage = await Message.findOne({ chatId: chat._id }).sort({ createdAt: -1 });
                    // If lastMessage is null, log a message to the console instead of crashing app
                    if (!lastMessage) {
                        return null;
                    }

                    return {
                        ...chat._doc,
                        otherUsername: otherUser ? otherUser.username : null,
                        lastMessage
                    };
                }));
                const filteredChats = chatsWithUsernamesAndLastMessage.filter(chat => chat !== null);

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
