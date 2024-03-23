const express = require('express');
const messageRouter = express.Router();
const { getChatMessages, createMessage, deleteMessage } = require('../controllers/message.controller');


messageRouter.get('/getMessage', getChatMessages);

messageRouter.post('/sendMessage', createMessage);

messageRouter.post('/deleteMessage', deleteMessage);

module.exports = messageRouter;