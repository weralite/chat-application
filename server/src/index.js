const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Import the cors package

const PORT = process.env.PORT || 8000;

// Create an HTTP server
const server = http.createServer();

// Initialize Socket.IO and attach it to the server
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A client connected');

  // Handle socket events (e.g., chat messages, user connections, etc.)
  socket.on('chatMessage', (message) => {
    console.log('Received message:', message);
    // Broadcast the message to all connected clients
    io.emit('chatMessage', message);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Start the server and listen for incoming WebSocket connections
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
