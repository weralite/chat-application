const { deleteOne } = require('../models/chat.model');
const Message = require('../models/message.model');



module.exports = (io, emitToUser, connectedUsers) => {
    io.on('connection', (socket) => {

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

                if (connectedUsers[receiver]) {
                    message.status = 'delivered';
                    await message.save();
                }

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

        socket.on('userConnected', async (userId) => {
            try {
                const messages = await Message.find({ receiver: userId, status: 'sent' });

                for (let message of messages) {
                    message.status = 'delivered';
                    await message.save();

                    emitToUser(message.sender, 'message_status_updated', message);
                }
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

        socket.on('delete_message', async (messageData) => {
            try {
                const message = await Message.findById(messageData._id);
        
                if (!message) {
                    console.error(`No message found with ID: ${messageData._id}`);
                    return;
                }
        
                await Message.deleteOne({ _id: messageData._id });
        
                emitToUser(message.sender, 'messageDeleted', messageData._id);
                emitToUser(message.receiver, 'messageDeleted', messageData._id);
            } catch (error) {
                console.error('Error deleting message:', error);
                socket.emit('error', 'Failed to delete message');
            }
        });

    });

};