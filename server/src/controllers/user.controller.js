const User = require('../models/user.model');
const bcrypt = require('bcrypt');

// User registration controller
async function createUser(req, res) {
  try {
    const _user = req.body;
    const hashedPassword = await bcrypt.hash(_user.password, 10);
    const user = await User.create({ ..._user, password: hashedPassword });
    console.log('User created: ', user);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user: ", error);
    if (error.message.includes('duplicate key error')) {
      return res.status(400).send('Credential error');
    }
    res.status(500).send('An error occurred while creating the user');

  }
}


async function getUsers(req, res) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users: ", error);
    res.status(500).send('An error occurred while getting users');
  }
}

module.exports = { createUser, getUsers };