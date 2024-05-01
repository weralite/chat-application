const User = require('../models/user.model');
const bcrypt = require('bcrypt');

async function createUser(req, res) {
  try {
    const _user = req.body;
    const hashedPassword = await bcrypt.hash(_user.password, 10);
    const user = await User.create({ ..._user, password: hashedPassword });
 
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

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await
    User.findById(id);
    res.status(200).json(user);
  }
  catch (error) {
    console.error("Error getting user: ", error);
    res.status(500).send('An error occurred while getting user');
  }
}


async function getUsersByName(req, res) {
  try {
      const { name } = req.query;
      let users;

      if (name) {
          const regex = new RegExp(name, 'i');
          users = await User.find({ username: regex });
      } else {
        users = await User.find();
      }

      res.json(users);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}


module.exports = { createUser, getUsers, getUsersByName, getUserById };