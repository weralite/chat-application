const Message = require('../models/message.model');

module.exports = (io, emitToUser) => {
    io.on('connection', (socket) => {
        
        socket.on('get_messages', async ({ chatId }) => {
            try {
                const messages = await Message.find({ chatId });
                socket.emit('receive_messages', messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
                emitToUser(socket.id, 'error', 'Failed to fetch messages');
            }
        });

        socket.on('send_message', async ({ chatId, sender, receiver, content }) => {
            try {
                const message = new Message({ chatId, sender, receiver, content });
                await message.save();
                
                emitToUser(sender, 'message_sent', message);
                emitToUser(receiver, 'message_sent', message);
                
                message.status = 'delivered';
                await message.save();

                emitToUser(sender, 'message_status_updated', message);
                emitToUser(receiver, 'message_status_updated', message);
            } catch (error) {
                console.error('Error sending message:', error);
                emitToUser(sender, 'error', 'Failed to send message');
            }
        });

        socket.on('message_read', async (messageId) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) {
                    emitToUser(socket.id, 'error', 'Message not found');
                    return;
                }

                message.status = 'read';
                await message.save();

                emitToUser(message.sender, 'message_status_updated', message);
                emitToUser(message.receiver, 'message_status_updated', message);
            } catch (error) {
                console.error('Error updating message status:', error);
                emitToUser(socket.id, 'error', 'Failed to update message status');
            }
        });
    });
};
