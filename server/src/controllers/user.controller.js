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
      return res.status(400).send('User with that username already exists');
    }
    res.status(500).send('An error occurred while creating the user');

  }
}



module.exports = { createUser };