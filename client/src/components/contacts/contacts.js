import React from 'react'
import axios from 'axios';
import { useEffect } from 'react';


const Contacts = ({ userId, contacts, setContacts, handleContactClick, socket }) => {

    useEffect(() => {
        if (!socket) return;

        socket.on('contactBlocked', ({ contactId, blockedBy }) => {
            setContacts(prevContacts => {
                return prevContacts.map(contact => {
                    if (contact._id === contactId) {
                        return { ...contact, blockedBy };
                    }
                    return contact;
                });
            });
        });
        socket.on('contactUnBlocked', ({ contactId, blockedBy }) => {
            setContacts(prevContacts => {
                return prevContacts.map(contact => {
                    if (contact._id === contactId) {
                        return { ...contact, blockedBy: null };
                    }
                    return contact;
                });
            });
        });
        return () => {
            socket.off('contactBlocked');
            socket.off('contactUnBlocked');
        };
    }, [socket, setContacts]);



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
                        if (user.blockedBy && !user.blockedBy.includes(userId)) {
                            return null; 
                        } else {
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
                        }
                    })}
                </ul>
            </div>
        </div>
    )
}

export default Contacts