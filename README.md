# Chat Application

This is a simple chat application built with Node.js and Socket.io. It allows users to engage in a conversation and send messages in real-time to each other.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/chat-application.git

 ## Server - cd server
   
2. **Install dependencies:**

   ```bash
   npm install
3. **Start the server:**

   ```bash
   npm run dev

  ## Client - cd client
   
4. **Install dependencies:**

   ```bash
   npm install
5. **Start the server:**

   ```bash
   npm start

   ## Environment Variables

# The application relies on several environment variables for configuration. These variables should be set  in a `.env` inside server folder.

## Required Variables

 **`PORT`**: Specifies the port on which the server will listen for incoming connections. Frontend is currently listening to server port 8000 in ENDPOINT variable inside chat.js

   ```plaintext
   PORT=8000 

   MONGODB_URI=mongodb://localhost:27017/chatapp

   JWT_SECRET=mysecretkey



 # About
**Usage**
Visit the application in your web browser.
Register and login, add a contact by searching for a username.
Engage in conversation via dropdown menu of added contact.
Start chatting with other users in real-time!


**Dependencies**
bcrypt: For password hashing.
crypto: For cryptographic functions.
express: Web framework for Node.js.
jsonwebtoken: For generating and verifying JSON web tokens.
mongoose: MongoDB object modeling tool.
nodemon: Utility that automatically restarts the server when changes are detected.
socket.io: Real-time bidirectional event-based communication library.






