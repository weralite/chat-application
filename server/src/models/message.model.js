const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: {
      type: String,
    },
    recieverID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  }
  , {
    timestamps: true,
  }
  );

    const Message = mongoose.model('Messages', messageSchema);

    module.exports = Message;