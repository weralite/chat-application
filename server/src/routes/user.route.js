const express = require('express');
const userRouter = express.Router();
const { createUser, getUsers, getUsersByName, getUserById } = require('../controllers/user.controller');


userRouter.post('/register', createUser);

userRouter.get('/allusers', getUsers);

userRouter.get('/users', getUsersByName);

userRouter.get('/user/:id', getUserById);


module.exports = userRouter;