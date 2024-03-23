const Message = require('../models/message.model');

async function createMessage(data) {
    try {
        const message = await Message.create(data);
        return message;
    } catch (error) {
        console.error('Error creating message:', error);
    }
}

async function getMessages(req, res) {
    try {
        const message = await Message.find({ chatID: id }).sort({
            dateCreated: 1,
        })
        res.status(200).json(message);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function deleteMessage(req, res) {
    try {
        const { id } = req.params;
        const message = await Message.deleteOne({
            _id:
                id
        });
        res.status(200).json(message);
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { createMessage, getMessages, deleteMessage };