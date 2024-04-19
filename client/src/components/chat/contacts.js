import React from 'react'
import axios from 'axios';
import { useEffect } from 'react';


const Contacts = ({ userId, contacts, setContacts, handleContactClick }) => {


    const blockContact = async (user1Id, user2Id) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/v1/contacts/blockContact`, { user1Id, user2Id });
            return response.data.message;
        } catch (error) {
            console.error('Error blocking contact:', error);
            throw new Error('Failed to block contact');
        }
    };

    const unblockContact = async (user1Id, user2Id) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/v1/contacts/unblockContact`, { user1Id, user2Id });
            return response.data.message;
        } catch (error) {
            console.error('Error unblocking contact:', error);
            throw new Error('Failed to unblock contact');
        }
    };

    return (
        <div className='contacts-content'>
            <h5>Contacts</h5>
            <input type='text' placeholder='Search contacts' />
            <div className='contacts-inner'>
                <ul>
                    {contacts.map((contact) => (

                        <li key={contact._id} onClick={() => handleContactClick(contact._id)}>
                            {contact.username}
                            {/* <button onClick={() => blockContact(userId, contact.id)}>Block</button>
                        <button onClick={() => unblockContact(userId, contact.id)}>Unblock</button> */}
                        </li>
                    ))}

                </ul>
            </div>
            <button>Add contact</button>

        </div>
    )
}

export default Contacts