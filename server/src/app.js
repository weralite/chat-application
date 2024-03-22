const Express = require("express");
const cors = require("cors")
const userRouter = require("./routes/user.route");
const authRouter = require("./routes/auth.route");

const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"]
}))

app.use("/api/v1", userRouter);
app.use("/api/v1", authRouter);

module.exports = app