const express = require('express');
const messageRouter = express.Router();
const { getChatMessages, deleteMessage } = require('../controllers/message.controller');


messageRouter.get('/getMessages/:chatId', getChatMessages);

messageRouter.post('/deleteMessage', deleteMessage);

module.exports = messageRouter;