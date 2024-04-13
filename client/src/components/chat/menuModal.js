// ContactsModal.js
import React from 'react';
import { blockContact, unblockContact } from './contactBlock';

const ContactsModal = ({ username, userId, contacts, modalRef, isModalVisible, handleContactClick, setModalVisible }) => {
console.log('contacts', contacts)
    return (
        <div ref={modalRef} className={`menu-modal ${isModalVisible ? 'visible' : ''}`}>
            <div className='user-card'>
                <h4>{username}</h4>

            </div>

            <div className='contacts-content'>
                <input type='text' placeholder='Search contacts' />
                <ul>
                    {contacts.map((contact) => (
                    
                        <li key={contact.id} onClick={() => handleContactClick(contact.id)}>{contact.username}
                            <button onClick={() => blockContact(userId, contact.id)}>Block</button>
                            <button onClick={() => unblockContact(userId, contact.id)}>Unblock</button>
                        </li>
                    ))}
                    
                </ul>
                <button>Add contact</button>

            </div>
                <div className='button-container'>
                <button className='menu-button'>Logout</button>
                <button className='menu-button' onClick={() => setModalVisible(false)}>Close</button>
                </div>

        </div>
    );
};

export default ContactsModal;
