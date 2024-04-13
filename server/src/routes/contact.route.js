const express = require('express');
const contactRouter = express.Router();
const { createContact, getContacts, deleteContact, blockContact, unBlockContact } = require('../controllers/contact.controller');


contactRouter.post('/createContact', createContact);
contactRouter.get('/getContacts', getContacts);
contactRouter.delete('/deleteContact', deleteContact);
contactRouter.put('/blockContact', blockContact);
contactRouter.put('/unBlockContact', unBlockContact);

module.exports = contactRouter;