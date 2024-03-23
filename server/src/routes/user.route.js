const express = require('express');
const userRouter = express.Router();
const { createUser, getUsers } = require('../controllers/user.controller');


userRouter.post('/register', createUser);
userRouter.get('/allusers', getUsers);


module.exports = userRouter;