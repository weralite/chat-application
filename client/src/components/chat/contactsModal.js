// ContactsModal.js
import React from 'react';
import { blockContact, unblockContact } from './contactBlock';

const ContactsModal = ({ userId, contacts, modalRef, isModalVisible, handleContactClick, setModalVisible }) => {

    return (
        <div ref={modalRef} className={`contacts-modal ${isModalVisible ? 'visible' : ''}`}>
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
                <button onClick={() => setModalVisible(false)}>Close</button>
            </div>
        </div>
    );
};

export default ContactsModal;
