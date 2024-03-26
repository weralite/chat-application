// contactsSocketController.js

const Contact = require('../models/contact.model');
const User = require('../models/user.model');

module.exports = (io) => {
    io.on('connection', (socket) => {
        // Fetch contacts when a client requests
        socket.on('get_contacts', async (userId) => {
            try {
                // Retrieve contacts from the database
                const contacts = await Contact.find({ $or: [{ user1Id: userId }, { user2Id: userId }] }).lean();
                // Fetch usernames for contact IDs
                const contactsWithUsernames = await Promise.all(contacts.map(async (contact) => {
                    const user1 = await User.findById(contact.user1Id);
                    const user2 = await User.findById(contact.user2Id);
                    return {
                        ...contact,
                        Username1: user1 ? user1.username : null,
                        Username2: user2 ? user2.username : null
                    };
                }));
                // Emit the contacts with usernames to the client
                console.log('Contacts with usernames fetched:', contactsWithUsernames);
                socket.emit('receive_contacts', contactsWithUsernames);
            } catch (error) {
                console.error('Error fetching contacts:', error);
                // Emit an error message to the client if something goes wrong
                socket.emit('error', 'Failed to fetch contacts');
            }
        });
    });
};