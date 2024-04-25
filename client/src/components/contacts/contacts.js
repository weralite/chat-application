import React from 'react'
import axios from 'axios';
import { useEffect } from 'react';


const Contacts = ({ userId, contacts, setContacts, handleContactClick, socket }) => {


    // Listen for contactBlocked and contactUnBlocked events
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

    // Emits blockContact and unblock event to server
    useEffect(() => {
        if (socket) {
            socket.on('blockContactSuccess', ({ contactId, blockedBy }) => {
                setContacts(prevContacts => {
                    return prevContacts.map(contact => {
                        if (contact._id === contactId) {
                            return { ...contact, blockedBy };
                        }
                        return contact;
                    });
                });
            });

            socket.on('unblockContactSuccess', ({ contactId }) => {
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

    const deleteContact = async (contactId) => {
        try {
            const res = await axios.delete('http://localhost:8080/api/v1/contacts/deleteContact', {
                params: {
                    contactId
                }
            });
            if (res.status === 200) {
                setContacts(prevContacts => {
                    return prevContacts.filter(contact => contact._id !== contactId);
                });
            }
        } catch (err) {
            console.error(err);
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
                                    <button onClick={() => deleteContact(user._id)}>Delete</button>
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