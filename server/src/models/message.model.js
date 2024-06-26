const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, minLength: 1, maxLength: 255 },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    }
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Messages', messageSchema);

module.exports = Message;