const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    participants: [{ type: Types.ObjectId, ref: "users" }],
    timestamp: true,
});

const Chat = model("chat", chatSchema);

module.exports = Chat;