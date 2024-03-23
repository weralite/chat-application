const express = require('express');
const messagesRouter = express.Router();
const { getMessages, deleteMessage } = require('../controllers/messages.controller');


messagesRouter.get('/getmsg', getMessages);

messagesRouter.post('/deletemsg', deleteMessage);

