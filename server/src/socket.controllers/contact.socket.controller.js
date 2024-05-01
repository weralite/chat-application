const Contact = require('../models/contact.model');

module.exports = (io, emitEventsToUsers) => {
    io.on('connection', (socket) => {
        socket.on('blockContact', async ({ contactId, userId }) => {
            try {
                const contact = await Contact.findById(contactId);
                if (!contact) {
                    socket.emit(userId, 'blockContactError', 'Contact not found');
                    return;
                }

                const blockedUserId = userId === contact.user1Id.toString() ? contact.user2Id : contact.user1Id;

                // Add the current user to the blockedBy field if not already present
                contact.blockedBy = contact.blockedBy ? [...contact.blockedBy, userId] : [userId];
                await contact.save();

                const events = [
                    { eventName: 'contactBlocked', eventData: { contactId, blockedBy: userId } },
                    { eventName: 'requestChatUpdate', eventData: { userId, blockedUserId } },
                    { eventName: 'blockContactSuccess', eventData: { contactId, blockedBy: userId } },
                ];
                
                emitEventsToUsers([blockedUserId, userId], events);

            } catch (error) {
                console.error('Error blocking contact:', error);
                socket.emit(userId, 'blockContactError', 'Error blocking contact');
            }
        });

        socket.on('unblockContact', async ({ contactId, userId }) => {
            try {
                const contact = await Contact.findById(contactId);
                if (!contact) {
                    socket.emit(userId, 'unblockContactError', 'Contact not found');
                    return;
                }
                const unBlockedUserId = userId === contact.user1Id.toString() ? contact.user2Id : contact.user1Id;

                // Reset the blockedBy field
                contact.blockedBy = undefined;
                await contact.save();
 
                const events = [
                    { eventName: 'contactUnblocked', eventData: { contactId } },
                    { eventName: 'requestChatUpdate', eventData: { userId, unBlockedUserId } },
                    { eventName: 'unblockContactSuccess', eventData: { contactId, unblockedBy: userId } },
                ];
                emitEventsToUsers([unBlockedUserId, userId], events);

            } catch (error) {
                console.error('Error unblocking contact:', error);
                socket.emit(userId, 'unblockContactError', 'Error unblocking contact');
            }
        });

    });
};
