// ContactsModal.js
import React from 'react';
import Contacts from './contacts';

const ContactsModal = ({ username, userId, contacts, setContacts, modalRef, isModalVisible, handleContactClick, setModalVisible }) => {
    return (
        <div ref={modalRef} className={`menu-modal ${isModalVisible ? 'visible' : ''}`}>
            <div className='user-contact-box'>
            <div className='user-card'>
                <h4>{username}</h4>
            </div>

            <Contacts 
            userId={userId}
            setContacts={setContacts}
            contacts={contacts}
            handleContactClick={handleContactClick}
            />
            </div>


                <div className='button-container'>
                <button className='menu-button'>Logout</button>
                <button className='menu-button' onClick={() => setModalVisible(false)}>Close</button>
                </div>

        </div>
    );
};

export default ContactsModal;
