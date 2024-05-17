const app = require("./app");
const { connectToMongoose } = require("./config/mongoose");
const chatSocketController = require("./socket.controllers/chat.socket.controller");
const messageSocketController = require("./socket.controllers/message.socket.controller");
const contactsSocketController = require("./socket.controllers/contact.socket.controller");
const socketAuth = require('./socketHelpers/socketAuth');
const http = require("http");
const socketIo = require("socket.io");
require('dotenv').config();

const port = process.env.PORT || 8000
const server = http.createServer(app)
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

let connectedUsers = {};

const emitToUser = (userID, eventName, data) => {
    const socketID = connectedUsers[userID];
    if (socketID) {
        io.to(socketID).emit(eventName, data);
    } else {
        console.log(`User with ID ${userID} is not connected.`);
    }
};

chatSocketController(io, emitToUser);
messageSocketController(io, emitToUser, connectedUsers);
contactsSocketController(io, emitToUser);

io.use(socketAuth);

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    const socketId = socket.id;
    if (!userId) {
        console.error('User ID not provided in handshake query');
        return;
    }

    connectedUsers[userId] = socketId; // Store the socket ID in your connectedUsers object
    io.emit('userConnected', userId);
    io.emit('connectedUsers', Object.keys(connectedUsers));
    console.log('User connected:', userId);


    socket.on('disconnect', () => {
        if (connectedUsers[userId]) {
            console.log('User disconnected:', userId);
            delete connectedUsers[userId];
            io.emit('userDisconnected', userId);
            io.emit('connectedUsers', Object.keys(connectedUsers));
        }
    });
    
});

server.listen(port, () => {
    console.log("Server running on ", port)
    connectToMongoose()
})