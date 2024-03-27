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
                console.log(message); // Log the entire message object
                await message.save();
        
                const isReceiverConnected = checkIfUserConnectedToChat(receiver, chatId);
                console.log(`Is receiver connected: ${isReceiverConnected}`);
                if (!isReceiverConnected) {
                    // If the receiver is not connected, increment their unread message count
                    incrementUnreadCount(receiver, chatId);
                    console.log('Incremented unread count');
                }
                // Emit the 'message_sent' event to the client with the new message
                socket.emit('message_sent', message);
                socket.broadcast.emit('receive_messages', [message]);
            } catch (error) {
                console.error('Error sending message:', error);
                // Emit an error message to the client if something goes wrong
                socket.emit('error', 'Failed to send message');
            }
        });

    });

};
