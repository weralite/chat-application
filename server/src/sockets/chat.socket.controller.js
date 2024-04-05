const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const Message = require('../models/message.model');

module.exports = (io) => {
    io.on('connection', (socket) => {

        socket.on('get_chats', async ({ senderId, receiverId }) => {
            try {
                // Find a chat where both sender and receiver are participants
                let chat = await Chat.findOne({
                    participants: { $all: [senderId, receiverId] }
                });

                if (!chat) {
                    // Create a new chat with participants
                    chat = new Chat({ participants: [senderId, receiverId] });
                    await chat.save();
                }

                // Fetch sender and receiver details
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
                // Find all chats where the specified user is a participant
                const chats = await Chat.find({
                    participants: userId // Finding chats where the userId is included in participants
                });

                // Fetch additional information for each chat
                const chatsWithUsernamesAndLastMessage = await Promise.all(chats.map(async (chat) => {
                    // Determine the other participant's user ID
                    const otherUserId = chat.participants.find(participantId => participantId.toString() !== userId);
                    // Find the other participant's user document
                    const otherUser = await User.findById(otherUserId);
                    // Fetch the last message of the chat
                    let lastMessage = await Message.findOne({ chatId: chat._id }).sort({ createdAt: -1 });

                    // If lastMessage is null, log a message to the console
                    if (!lastMessage) {
                        console.log(`Last message for chat ${chat._id} is null`);
                        lastMessage = {};
                    }

                    return {
                        ...chat._doc,
                        otherUsername: otherUser ? otherUser.username : null,
                        lastMessage
                    };
                }));
                socket.emit('chats', chatsWithUsernamesAndLastMessage);
            } catch (error) {
                console.error('Error fetching chats:', error);
                socket.emit('error', 'Failed to fetch chats');
            }
        });

    });
};
