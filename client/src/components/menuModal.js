import React from 'react';
import Contacts from './contacts/contacts';
import { useRef, useState, useEffect } from 'react';
import ContactsModal from './contacts/addContactsModal';

const MenuModal = ({ username, userId, contacts, setContacts, modalRef, isModalVisible, handleContactClick, setModalVisible }) => {
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const addModalRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (addModalRef.current && !addModalRef.current.contains(event.target)) {
                setAddModalVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [addModalRef]);


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
                <ContactsModal
                    addModalRef={addModalRef}
                    isAddModalVisible={isAddModalVisible}
                    setAddModalVisible={setAddModalVisible}
                    staticUserId={userId}
                />
                <button onClick={() => {
                    setAddModalVisible(true);
                    }}> Add contact
                </button>
            </div>

            <div className='button-container'>
                <button className='menu-button'>Logout</button>
                <button className='menu-button' onClick={() => setModalVisible(false)}>Close</button>
            </div>
        </div>
    );
};

export default MenuModal;
