const express = require('express');
const contactRouter = express.Router();
const { createContact, getContactsForUser, deleteContact, blockContact, unBlockContact } = require('../controllers/contact.controller');


contactRouter.post('/createContact', createContact);
contactRouter.get('/getContacts', getContactsForUser);
contactRouter.delete('/deleteContact', deleteContact);
contactRouter.put('/blockContact', blockContact);
contactRouter.put('/unBlockContact', unBlockContact);

module.exports = contactRouter;