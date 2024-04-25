const app = require("./app");
const { connectToMongoose } = require("./config/mongoose");
const chatSocketController = require("./socket.controllers/chat.socket.controller");
const messageSocketController = require("./socket.controllers/message.socket.controller");
const contactsSocketController = require("./socket.controllers/contact.socket.controller");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 8000

const server = http.createServer(app)
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

chatSocketController(io);
messageSocketController(io);
contactsSocketController(io);

let connectedUsers = {};

io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                console.log('Token verification failed:', err);
                return next(new Error('Authentication error'));
            }
            socket.decoded = decoded;
            console.log('Token verified, establishing connection');
            next();
        });
    }
    else {
        console.log('No token provided');
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    const socketId = socket.id;
    if (!userId) {
        console.error('User ID not provided in handshake query');
        return;
    }
    connectedUsers[userId] = socketId; // Store the socket ID in your connectedUsers object
    io.emit('userConnected', userId);
    console.log('User connected:', userId, 'with socket ID:', socketId);
    io.emit('connectedUsers', Object.keys(connectedUsers));


    socket.on('disconnect', () => {
        if (connectedUsers[userId]) {
            delete connectedUsers[userId];
            io.emit('userDisconnected', userId);
            console.log('User disconnected:', userId);
            io.emit('connectedUsers', Object.keys(connectedUsers));
        }
    });
});

app.get('/isUserConnected/:userId', (req, res) => {
    const userId = req.params.userId;
    const isConnected = !!connectedUsers[userId];
    res.send(isConnected);
});


server.listen(port, () => {
    console.log("Server running on ", port)
    connectToMongoose()
})