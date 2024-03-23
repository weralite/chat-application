const express = require('express');
const userRouter = express.Router();
const { createUser, getUsers } = require('../controllers/user.controller');


userRouter.post('/register', createUser);
userRouter.post('/allusers', getUsers);


module.exports = userRouter;