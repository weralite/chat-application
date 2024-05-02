const Message = require('../models/message.model');


module.exports = (io, emitToUser) => {
    io.on('connection', (socket) => {

        // Emits all messages in a chat to the user who requested them
        socket.on('get_messages', async ({ chatId }) => {
            try {
                const messages = await Message.find({ chatId });
                socket.emit('message', messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
                socket.emit('error', 'Failed to fetch messages');
            }
        });


        socket.on('send_message', async ({ chatId, sender, receiver, content }) => {
            try {
                const message = new Message({ chatId, sender, receiver, content });
                await message.save();

                // message.status = 'delivered';
                // await message.save();

                const users = [sender, receiver];

                const events = [
                    { eventName: 'message', eventData: [message] },
                    { eventName: 'message_status_updated', eventData: message },
                ];

                users.forEach(user => {
                    events.forEach(event => {
                        emitToUser(user, event.eventName, event.eventData);
                    });
                });

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', 'Failed to send message');
            }
        });


        socket.on('message_delivered', async (messageId) => {
            try {
                const message = await Message.findById(messageId);
                message.status = 'delivered';
                await message.save();

                const users = [message.sender, message.receiver];

                const event = { eventName: 'message_status_updated', eventData: message };

                users.forEach(user => {
                    emitToUser(user, event.eventName, event.eventData);
                });

            } catch (error) {
                console.error('Error updating message status:', error);
                socket.emit('error', 'Failed to update message status');
            }
        });

        socket.on('message_read', async (messageId) => {
            try {
                const message = await Message.findById(messageId);
                message.status = 'read';
                await message.save();

                const users = [message.sender, message.receiver];

                const event = { eventName: 'message_status_updated', eventData: message };

                users.forEach(user => {
                    emitToUser(user, event.eventName, event.eventData);
                });

            } catch (error) {
                console.error('Error updating message status:', error);
                socket.emit('error', 'Failed to update message status');
            }
        });

    });

};