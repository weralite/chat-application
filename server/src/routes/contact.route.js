const express = require('express');
const contactRouter = express.Router();
const { createContact, getContact, getAllContacts, deleteContact, blockContact, unBlockContact } = require('../controllers/contact.controller');


contactRouter.post('/createContact', createContact);
contactRouter.get('/getContacts', getContact);
contactRouter.get('/getAllContacts', getAllContacts);
contactRouter.delete('/deleteContact', deleteContact);
contactRouter.put('/blockContact', blockContact);
contactRouter.put('/unBlockContact', unBlockContact);

module.exports = contactRouter;