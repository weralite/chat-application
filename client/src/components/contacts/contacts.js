import React from 'react'
import axios from 'axios';
import { useEffect } from 'react';


const Contacts = ({ userId, contacts, setContacts, handleContactClick, socket }) => {


    // const blockContact = async ({ userId, contactId }) => {
    //     try {
    //         const response = await axios.put(`http://localhost:8080/api/v1/contacts/blockContact`, { userId, contactId });
    //         const message = response.data.message;
    //         // Update the contacts state to reflect the change
    //         setContacts(prevContacts => {
    //             return prevContacts.map(contact => {
    //                 if (contact._id === contactId) {
    //                     return { ...contact, blockedBy: userId };
    //                 }
    //                 return contact;
    //             });
    //         });
    //         return message; // Return message for any further handling if needed
    //     } catch (error) {
    //         console.error('Error blocking contact:', error);
    //         throw new Error('Failed to block contact');
    //     }
    // };

    // const unblockContact = async ({ userId, contactId }) => {
    //     try {
    //         const response = await axios.put(`http://localhost:8080/api/v1/contacts/unblockContact`, { userId, contactId });
    //         const message = response.data.message;
    //         // Update the contacts state to reflect the change
    //         setContacts(prevContacts => {
    //             return prevContacts.map(contact => {
    //                 if (contact._id === contactId) {
    //                     return { ...contact, blockedBy: null };
    //                 }
    //                 return contact;
    //             });
    //         });
    //         return message; // Return message for any further handling if needed
    //     } catch (error) {
    //         console.error('Error unblocking contact:', error);
    //         throw new Error('Failed to unblock contact');
    //     }
    // };
    useEffect(() => {
        if (socket) {
            socket.on('blockContactSuccess', ({ contactId, blockedBy }) => {
                // Update contacts state to reflect the block action
                setContacts(prevContacts => {
                    return prevContacts.map(contact => {
                        if (contact._id === contactId) {
                            // Update the contact's blockedBy field
                            return { ...contact, blockedBy };
                        }
                        return contact;
                    });
                });
            });
    
            socket.on('unblockContactSuccess', ({ contactId }) => {
                // Update contacts state to reflect the unblock action
                setContacts(prevContacts => {
                    return prevContacts.map(contact => {
                        if (contact._id === contactId) {
                            // Set the contact's blockedBy field to null
                            return { ...contact, blockedBy: null };
                        }
                        return contact;
                    });
                });
            });
    
            return () => {
                // Clean up event listeners when component unmounts
                socket.off('blockContactSuccess');
                socket.off('unblockContactSuccess');
            };
        }
    }, [socket, setContacts]);

    const blockContact = (contactId) => {
        if (socket) {
            socket.emit('blockContact', { userId, contactId });
        }
    };

    const unblockContact = (contactId) => {
        if (socket) {
            socket.emit('unblockContact', { userId, contactId });
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
                                    <button onClick={() => unblockContact(user._id)}>Unblock</button>
                                    :
                                    <button onClick={() => blockContact(user._id)}>Block</button>
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