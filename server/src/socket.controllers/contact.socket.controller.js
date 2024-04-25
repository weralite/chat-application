const Contact = require('../models/contact.model');

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('blockContact', async ({ contactId, userId }) => {
            try {
                const contact = await Contact.findById(contactId);
                if (!contact) {
                    io.to(userId).emit('blockContactError', 'Contact not found');
                    return;
                }
                
                contact.blockedBy = contact.blockedBy ? [...contact.blockedBy, userId] : [userId];
                await contact.save();

                socket.emit('blockContactSuccess', { contactId, blockedBy: userId });
                io.emit('contactBlocked', { contactId, blockedBy: userId });
                // io.to(contactId).emit('contactBlocked', { contactId, blockedBy: userId });
                
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
                io.emit('contactUnBlocked', { contactId, blockedBy: userId });
            } catch (error) {
                console.error('Error unblocking contact:', error);
                io.to(userId).emit('unblockContactError', 'Error unblocking contact');
            }
        });

    });

};
