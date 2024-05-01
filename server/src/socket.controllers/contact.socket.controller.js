const Contact = require('../models/contact.model');

module.exports = (io, emitToUser) => {
    io.on('connection', (socket) => {
        socket.on('blockContact', async ({ contactId, userId }) => {
            try {
                const contact = await Contact.findById(contactId);
                if (!contact) {
                    emitToUser(userId, 'blockContactError', 'Contact not found');
                    return;
                }

                const blockedUserId = userId === contact.user1Id.toString() ? contact.user2Id : contact.user1Id;

                // Add the current user to the blockedBy array if not already present
                contact.blockedBy = contact.blockedBy ? [...contact.blockedBy, userId] : [userId];
                await contact.save();

                // Emit events to both users involved in the contact
                emitToUser(blockedUserId, 'contactBlocked', { contactId, blockedBy: userId });
                emitToUser(userId, 'requestChatUpdate', { userId, blockedUserId });
                emitToUser(blockedUserId, 'requestChatUpdate', { userId, blockedUserId });

                // Emit success event to the user who initiated the block operation
                emitToUser(userId, 'blockContactSuccess', { contactId, blockedBy: userId });

            } catch (error) {
                console.error('Error blocking contact:', error);
                emitToUser(userId, 'blockContactError', 'Error blocking contact');
            }
        });

        socket.on('unblockContact', async ({ contactId, userId }) => {
            try {
                const contact = await Contact.findById(contactId);
                if (!contact) {
                    emitToUser(userId, 'unblockContactError', 'Contact not found');
                    return;
                }
                const unBlockedUserId = userId === contact.user1Id.toString() ? contact.user2Id : contact.user1Id;

                // Reset the blockedBy field
                contact.blockedBy = undefined;
                await contact.save();

                // Emit events to both users involved in the contact
                emitToUser(unBlockedUserId, 'contactUnblocked', { contactId, unblockedBy: userId });
                emitToUser(userId, 'requestChatUpdate', { userId, blockedUserId: contactId });
                emitToUser(unBlockedUserId, 'requestChatUpdate', { userId, blockedUserId: contactId });

                // Emit success event to the user who initiated the unblock operation
                emitToUser(userId, 'unblockContactSuccess', { contactId, unblockedBy: userId });

            } catch (error) {
                console.error('Error unblocking contact:', error);
                emitToUser(userId, 'unblockContactError', 'Error unblocking contact');
            }
        });

    });
};
