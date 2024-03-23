const express = require('express');
const authRouter = express.Router();
const { login } = require('../controllers/auth.controller');


authRouter.post('/login', login);

module.exports = authRouter;