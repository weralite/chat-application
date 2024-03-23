const dotenv = require("dotenv")
const { Server } = require("socket.io")
const mongoose = require("mongoose")

dotenv.config()

const io = new Server({
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
  },
})

mongoose
  .connect(process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/chat-test")
  .then(() => {
    console.log("db connected")
    io.listen(7000) // Assuming you want to listen on port 3000
    console.log("server started")
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error)
  })
