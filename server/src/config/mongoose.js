const mongoose = require("mongoose");

const databaseURI = process.env.MONGOOSE_LOCAL_URI;

function connectToMongoose() {
    mongoose.connect(databaseURI)
        .then(() => {
            console.log("Connected to DB: ", databaseURI)
        })
        .catch((error) => {
            console.log("Could not connect to DB: ", databaseURI, error)
        })
}

module.exports = {
    connectToMongoose
}