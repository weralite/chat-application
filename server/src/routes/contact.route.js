const express = require('express');
const contactRouter = express.Router();
const { createContact, getContact, getAllContacts, deleteContact } = require('../controllers/contact.controller');


contactRouter.post('/createContact', createContact);

contactRouter.get('/getContacts', getContact);

contactRouter.get('/getAllContacts', getAllContacts);

contactRouter.delete('/deleteContact/:id', deleteContact);


module.exports = contactRouter;