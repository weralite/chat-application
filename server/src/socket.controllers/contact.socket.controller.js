const Contact = require('../models/contact.model');

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('blockContact', async ({ contactId, userId }) => {
            try {
                console.log('Received blockContact event. Contact ID:', contactId, 'User ID:', userId);
                const contact = await Contact.findById(contactId);
                if (!contact) {
                    io.to(userId).emit('blockContactError', 'Contact not found');
                    return;
                }
                
                contact.blockedBy = contact.blockedBy ? [...contact.blockedBy, userId] : [userId];
                await contact.save();
                console.log('Contact blocked:', contact);
                socket.emit('blockContactSuccess', { contactId, blockedBy: userId });
                // Broadcast the update to all connected clients
                io.emit('contactBlocked', { contactId, blockedBy: userId });
                console.log('Contact blocked and broadcasted successfully');
            } catch (error) {
                console.error('Error blocking contact:', error);
                io.to(userId).emit('blockContactError', 'Error blocking contact');
            }
        });
        

        socket.on('unblockContact', async ({ contactId, userId }) => {
            try {
                const contact = await Contact.findById(contactId);
                if (!contact) {
                    io.to(userId).emit('unblockContactError', 'Contact not found');
                    return;
                }
                contact.blockedBy = undefined;
                await contact.save();

                socket.emit('unblockContactSuccess', { contactId, blockedBy: userId });
                io.emit('contactBlocked', { contactId, blockedBy: userId });
            } catch (error) {
                console.error('Error unblocking contact:', error);
                io.to(userId).emit('unblockContactError', 'Error unblocking contact');
            }
        });

    });

};
