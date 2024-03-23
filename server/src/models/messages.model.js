const mongoose = require('mongoose');

const messagesSchema = new mongoose.Schema({
    id: {
      type: String,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    recieverID: {
      required: true,
      type: String,
      trim: true,
    },
    senderID: {
      type: String,
      trim: true,
      required: true,
    },
    chatID: {
      type: String,
      trim: true,
      required: true,
    },
    timestamp: true,
  });

    const Messages = mongoose.model('Messages', messagesSchema);

    module.exports = Messages;