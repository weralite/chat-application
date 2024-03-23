const mongoose = require('mongoose');
const uuid = require('uuid');

function generateChatId() {
  return uuid.v4();
}

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, minLength: 1, maxLength: 255 },
    chatID: {
      type: String,
      trim: true,
      required: true,
      default: generateChatId
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Messages', messageSchema);

module.exports = Message;