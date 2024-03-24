const Express = require("express");
const cors = require("cors")
const userRouter = require("./routes/user.route");
const authRouter = require("./routes/auth.route");
const messageRouter = require("./routes/message.route");
const chatRouter = require("./routes/chat.route");
const contactRouter = require("./routes/contact.route");

const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"]
}))

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/contacts", contactRouter);

module.exports = app