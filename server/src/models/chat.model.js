const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chatId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chat', chatSchema);