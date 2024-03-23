import Messages from '../models/messages.model.js';

async function getMessages(req, res) {
    try {
        const messages = await Messages.find({ chatID: id }).sort({
            dateCreated: 1,
        })
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function deleteMessages (req, res) {
    try {
        const { id } = req.params;
        const messages = await Messages.deleteOne({ _id:
        id });
        res.status(200).json(messages);
    }   catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
}

module.exports = { getMessages, deleteMessages };