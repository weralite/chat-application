const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    user1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contact', contactSchema);