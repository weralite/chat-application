import React from 'react'
import axios from 'axios';
import { useRef, useState, useEffect } from 'react';
import ContactsModal from './addContactsModal';



const Contacts = ({ userId, contacts, setContacts, handleContactClick }) => {


    const blockContact = async ({ userId, contactId }) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/v1/contacts/blockContact`, { userId, contactId });
            return response.data.message;
        } catch (error) {
            console.error('Error blocking contact:', error);
            throw new Error('Failed to block contact');
        }
    };

    const unblockContact = async ({ userId, contactId }) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/v1/contacts/unblockContact`, { userId, contactId });
            return response.data.message;
        } catch (error) {
            console.error('Error unblocking contact:', error);
            throw new Error('Failed to unblock contact');
        }
    };

    return (
        <div className='contacts-content'>
            <div className='contacts-header'>
                <h5>Contacts</h5>
            </div>
            <input type='text' placeholder='Search contacts' />
            <div className='contacts-inner'>
                <ul>
                    {contacts.map((user) => {
                        return (
                            <li key={user._id}>
                                {user.contact.username}
                                <button onClick={() => handleContactClick(user.contact._id)}>Open chat</button>

                                {user.blockedBy && user.blockedBy.includes(userId) ?
                                    <button onClick={() => unblockContact({ userId, contactId: user._id })}>Unblock</button>
                                    :
                                    <button onClick={() => blockContact({ userId, contactId: user._id })}>Block</button>
                                }
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    )
}

export default Contacts