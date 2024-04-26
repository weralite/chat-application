const express = require('express');
const chatRouter = express.Router();
const { createChat, deleteChat } = require('../controllers/chat.controller');



chatRouter.post('/createChat', createChat);
chatRouter.delete('/deleteChat/:id', deleteChat);

module.exports = chatRouter;