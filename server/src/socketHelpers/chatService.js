const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const Contact = require('../models/contact.model');

module.exports.getContactPair = async (senderId, receiverId) => {
    return await Contact.findOne({
        $or: [
            { user1Id: senderId, user2Id: receiverId },
            { user1Id: receiverId, user2Id: senderId }
        ]
    });
};

module.exports.isBlocked = (contactPair, senderId, receiverId) => {
    return contactPair && contactPair.blockedBy && (contactPair.blockedBy.toString() === senderId || contactPair.blockedBy.toString() === receiverId);
};

module.exports.getChat = async (senderId, receiverId) => {
    return await Chat.findOne({
        participants: { $all: [senderId, receiverId] }
    });
};

module.exports.createChat = async (senderId, receiverId) => {
    const chat = new Chat({ participants: [senderId, receiverId] });
    return await chat.save();
};

module.exports.prepareChatWithUsernames = async (chat, senderId, receiverId) => {
    const [sender, receiver] = await Promise.all([
        User.findById(senderId),
        User.findById(receiverId)
    ]);

    return {
        ...chat._doc,
        senderUsername: sender ? sender.username : null,
        receiverUsername: receiver ? receiver.username : null
    };
};

// exports.getAllChats = async (userId) => {
//     // your code here
// };