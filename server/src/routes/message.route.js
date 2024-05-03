const express = require('express');
const messageRouter = express.Router();
const { getChatMessages, deleteMessage } = require('../controllers/message.controller');


messageRouter.get('/getMessages/:chatId', getChatMessages);

messageRouter.delete('/deleteMessage/:id', deleteMessage);



module.exports = messageRouter;