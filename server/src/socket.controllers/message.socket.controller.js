const Message = require('../models/message.model');


module.exports = (io, emitToUser) => {
    io.on('connection', (socket) => {
        socket.on('get_messages', async ({ chatId }) => {
            try {
                const messages = await Message.find({ chatId });
                socket.emit('receive_messages', messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
                socket.emit('error', 'Failed to fetch messages');
            }
        });


        socket.on('send_message', async ({ chatId, sender, receiver, content }) => {
            try {
                const message = new Message({ chatId, sender, receiver, content });
                await message.save();
                socket.emit('message_sent', message);
             
                message.status = 'delivered';
                await message.save();
                
                const users = [sender, receiver];

                const events = [
                    { eventName: 'receive_messages', eventData: [message] },
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

        socket.on('message_read', async (messageId) => {
            try {
                const message = await Message.findById(messageId);
                message.status = 'read';
                await message.save();
                socket.emit('message_status_updated', message);

//// Convert the following code to use emitToUser, similar to the code above.

                //// Ids might have to be converted into strings?

                console.log('receiver', message.receiver);
                console.log('sender', message.sender);
                socket.broadcast.emit('message_status_updated', message);
            } catch (error) {
                console.error('Error updating message status:', error);
                socket.emit('error', 'Failed to update message status');
            }
        });

    });

};