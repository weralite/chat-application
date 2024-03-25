// contactsSocketController.js

const Contact = require('../models/contact.model');

module.exports = (io) => {
    io.on('connection', (socket) => {
        // Fetch contacts when a client requests
        socket.on('get_contacts', async () => {
            try {
                // Retrieve contacts from the database
                const contacts = await Contact.find({});
                // Emit the contacts to the client
                console.log('Contacts fetched:', contacts);
                socket.emit('receive_contacts', contacts);
            } catch (error) {
                console.error('Error fetching contacts:', error);
                // Emit an error message to the client if something goes wrong
                socket.emit('error', 'Failed to fetch contacts');
            }
        });
    });
};
