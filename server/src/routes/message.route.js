const express = require('express');
const messageRouter = express.Router();
const { getChatMessages } = require('../controllers/message.controller');


messageRouter.get('/getMessages/:chatId', getChatMessages);


module.exports = messageRouter;