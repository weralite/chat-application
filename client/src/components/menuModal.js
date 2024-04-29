import React from 'react';
import Contacts from './contacts/contacts';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddContactsModal from './contacts/addContactsModal';

const MenuModal = ({ username, userId, setActiveChat, contacts, setContacts, chatList, setChatList, modalRef, fetchContacts, isModalVisible, handleContactClick, setModalVisible, socket }) => {
    const [isAddModalVisible, setAddModalVisible] = useState(false);

    const addModalRef = useRef(null);
    const navigate = useNavigate();

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

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };


    return (
        <div ref={modalRef} className={`menu-modal ${isModalVisible ? 'visible' : ''}`}>
            <div className='user-contact-box'>
                <div className='user-card'>
                    <h4>{username}</h4>
                </div>
                <Contacts
                    userId={userId}
                    setContacts={setContacts}
                    setChatList={setChatList}
                    chatList={chatList}
                    contacts={contacts}
                    setActiveChat={setActiveChat}
                    handleContactClick={handleContactClick}
                    socket={socket}
                />
                <AddContactsModal
                    addModalRef={addModalRef}
                    isAddModalVisible={isAddModalVisible}
                    setAddModalVisible={setAddModalVisible}
                    staticUserId={userId}
                    setContacts={setContacts}
                    fetchContacts={fetchContacts}
                    contacts={contacts}
                />
                <button onClick={() => {
                    setAddModalVisible(true);
                    }}> Add contact
                </button>
            </div>

            <div className='button-container'>
                <button className='menu-button' onClick={logout}>Logout</button>
                <button className='menu-button' onClick={() => setModalVisible(false)}>Close</button>
            </div>
        </div>
    );
};

export default MenuModal;
