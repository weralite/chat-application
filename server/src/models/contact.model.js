const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    user1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blockedByUser1: { type: Boolean, default: false }, // Indicates if user1 has blocked user2
    blockedByUser2: { type: Boolean, default: false }, // Indicates if user2 has blocked user1
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;