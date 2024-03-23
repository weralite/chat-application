const mongoose = require('mongoose');
const { Types } = mongoose; // Import the Types object from mongoose

const chatSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    participants: [{ type: Types.ObjectId, ref: "users" }], // Use Types.ObjectId instead of just ObjectId
    timestamps: true,
});

const Chat = mongoose.model("chat", chatSchema); // Use mongoose.model instead of just model

module.exports = Chat;