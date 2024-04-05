// ContactsModal.js
import React from 'react';

const ContactsModal = ({ contacts, modalRef, isModalVisible, handleContactClick, setModalVisible }) => {
    return (
        <div ref={modalRef} className={`contacts-modal ${isModalVisible ? 'visible' : ''}`}>
            <div className='contacts-content'>
                <input type='text' placeholder='Search contacts' />
                <ul>
                    {contacts.map((contact) => (
                        <li key={contact.id} onClick={() => handleContactClick(contact.id)}>{contact.username}</li>
                    ))}
                </ul>
    
                <button>Add contact</button>
                <button onClick={() => setModalVisible(false)}>Close</button>
            </div>
        </div>
    );
};

export default ContactsModal;
