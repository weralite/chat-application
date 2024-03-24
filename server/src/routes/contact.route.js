const express = require('express');
const contactRouter = express.Router();
const { createContact, getContactsForUser, deleteContact, blockContact } = require('../controllers/contact.controller');


contactRouter.post('/createContact', createContact);
contactRouter.get('/getContactsForUser', getContactsForUser);
contactRouter.delete('/deleteContact', deleteContact);
contactRouter.put('/blockContact', blockContact);

module.exports = contactRouter;