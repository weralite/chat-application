const express = require('express');
const userRouter = express.Router();
const { createUser, getUsers, getUsersByName } = require('../controllers/user.controller');


userRouter.post('/register', createUser);
userRouter.get('/allusers', getUsers);
userRouter.get('/user', getUsersByName);


module.exports = userRouter;