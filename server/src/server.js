const app = require("./app");
const { connectToMongoose } = require("./config/mongoose");
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

  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token){
        jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, function(err, decoded) {
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
    console.log('New client connected');

    // You can handle Socket.IO events here
    socket.on('message', (data) => {
        console.log('Message received: ' + data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


server.listen(port, () => {
    console.log("Server running on ", port)
    connectToMongoose()
})