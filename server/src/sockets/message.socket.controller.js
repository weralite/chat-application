//message.socket.controller.js

const Message = require('../models/message.model');


module.exports = (io) => {
    io.on('connection', (socket) => {
        // Fetch contacts when a client requests
        socket.on('get_messages', async ({ chatId }) => {
            try {
                // Retrieve contacts from the database
                const messages = await Message.find({ chatId });
                // Emit the contacts to the client
                socket.emit('receive_messages', messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
                // Emit an error message to the client if something goes wrong
                socket.emit('error', 'Failed to fetch messages');
            }
        });


        socket.on('send_message', async ({ chatId, sender, receiver, content }) => {
            try {
                // Create a new message in the database
                const message = new Message({ chatId, sender, receiver, content });
                await message.save();
                // Emit the 'message_sent' event to the client with the new message
                socket.emit('message_sent', message);
                socket.broadcast.emit('receive_messages', [message]);
                message.status = 'delivered';
                await message.save();
                socket.emit('message_status_updated', message);
                socket.broadcast.emit('message_status_updated', message);
            } catch (error) {
                console.error('Error sending message:', error);
                // Emit an error message to the client if something goes wrong
                socket.emit('error', 'Failed to send message');
            }
        });

        socket.on('message_read', async (messageId) => {
            try {
                const message = await Message.findById(messageId);
                message.status = 'read';
                await message.save();
                socket.emit('message_status_updated', message);
                console.log('message read', message);
                socket.broadcast.emit('message_status_updated', message);
            } catch (error) {
                console.error('Error updating message status:', error);
                socket.emit('error', 'Failed to update message status');
            }
        });

    });

};
