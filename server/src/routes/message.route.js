const express = require('express');
const messageRouter = express.Router();
const { getMessages, createMessage, deleteMessage } = require('../controllers/message.controller');


messageRouter.get('/getMessage', getMessages);

messageRouter.post('/sendMessage', createMessage);

messageRouter.post('/deleteMessage', deleteMessage);

module.exports = messageRouter;