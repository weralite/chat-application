import React from 'react'
import axios from 'axios';
import { useEffect } from 'react';


const Contacts = ({ userId, contacts, setContacts, handleContactClick }) => {


        const fetchContacts = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/v1/contacts/getContacts`, {
                    params: { userId: userId }
                });

                const contacts = response.data
                setContacts(contacts)
                console.log(contacts);
            } catch (error) {
                console.error('Failed to fetch contacts:', error);
            }
        };
    

   


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
            <input type='text' placeholder='Search contacts' />
            <button onClick={fetchContacts}>fetchh</button>
            <ul>
                {contacts.map((contact) => (

                    <li key={contact._id} onClick={() => handleContactClick(contact._id)}>{contact.username}
                        {/* <button onClick={() => blockContact(userId, contact.id)}>Block</button>
                        <button onClick={() => unblockContact(userId, contact.id)}>Unblock</button> */}
                    </li>
                ))}

            </ul>
            <button>Add contact</button>

        </div>
    )
}

export default Contacts