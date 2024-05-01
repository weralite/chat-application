const Message = require('../models/message.model');


module.exports = (io) => {
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
                socket.emit('message_status_updated', message);
                socket.broadcast.emit('message_status_updated', message);
                socket.broadcast.emit('receive_messages', [message]);
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
                socket.broadcast.emit('message_status_updated', message);
            } catch (error) {
                console.error('Error updating message status:', error);
                socket.emit('error', 'Failed to update message status');
            }
        });

    });

};