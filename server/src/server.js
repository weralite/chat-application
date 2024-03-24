const app = require("./app");
const { connectToMongoose } = require("./config/mongoose");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 8000

const server = http.createServer(app)
const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
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