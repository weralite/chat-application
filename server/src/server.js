const app = require("./app");
const { connectToMongoose } = require("./config/mongoose");


const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log("Server running on ", port)
    connectToMongoose()
})