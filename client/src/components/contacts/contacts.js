import React from 'react'
import axios from 'axios';
import { useEffect, useState } from 'react';
import '../../styles/contextmenu.style.css'
import { useRef } from 'react';
import { Icon } from '@iconify/react';


const Contacts = ({ userId, contacts, setContacts, setActiveChat, chatList, setChatList, handleContactClick, socket }) => {
    const [activeContextMenu, setActiveContextMenu] = useState(null);
    const contextMenuRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setActiveContextMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
    }, [socket, setContacts, setChatList]);

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
    }, [socket, setContacts, setChatList, contacts]);


    const blockContact = (contactId) => {
        setActiveContextMenu(null);
        if (socket) {
            socket.emit('blockContact', { userId, contactId });
        }
    };

    const unblockContact = (contactId) => {
        setActiveContextMenu(null);
        if (socket) {
            socket.emit('unblockContact', { userId, contactId });
        }
    };

   
    const deleteContact = async (contactId) => {
        if (window.confirm('Are you sure you want to delete this contact? Chat conversation will be deleted as well.')) {

            try {
                const res = await axios.delete(`http://localhost:8080/api/v1/contacts/deleteContact/${contactId}`);
                if (res.status === 200) {
                    setContacts(prevContacts => {
                        return prevContacts.filter(contact => contact._id !== contactId);
                    });
                    socket.emit('get_all_chats', { userId });
                    setActiveChat(null);
                    setActiveContextMenu(null);
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    const openContextMenu = (contactId) => {
        setActiveContextMenu(contactId);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredContacts = contacts.filter((user) => {
        return user.contact.username.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className='contacts-content'>
            <div className='contacts-header'>
                <h5>Contacts</h5>
            </div>
            <input
                type='text'
                placeholder='Search contacts'
                value={searchTerm}
                onChange={handleSearch}
            />
            <div className='contacts-inner'>
                <ul>
                    {filteredContacts.map((user) => {
                        if (user.blockedBy && !user.blockedBy.includes(userId)) {
                            return null;
                        } else {
                            return (
                                <li key={user._id} style={{ position: 'relative'}}>
                                    <Icon icon="gg:more-o" className='icon' width="18" height="18" style={{ color: "#726565" }}
                                        onClick={() => { openContextMenu(user._id); }} />
                                    {user.contact.username}
                                    {activeContextMenu === user._id && (
                                        <div ref={contextMenuRef} className="context-menu">
                                            <button onClick={() => handleContactClick(user.contact._id)}>Open chat</button>
                                            {user.blockedBy && user.blockedBy.includes(userId) ?
                                                <button onClick={() =>
                                                    unblockContact(user._id)}>Unblock</button>
                                                :
                                                <button onClick={() => blockContact(user._id)}>Block</button>
                                            }
                                            <button onClick={() => deleteContact(user._id)}>Delete</button>
                                        </div>
                                    )}
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