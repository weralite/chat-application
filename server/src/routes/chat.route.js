const express = require('express');
const chatRouter = express.Router();
const { createChat } = require('../controllers/chat.controller');



chatRouter.post('/createChat', createChat);

module.exports = chatRouter;