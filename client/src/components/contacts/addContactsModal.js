import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomAutocomplete from '../autoComplete/autoComplete';
import '../../styles/modal.style.css';


const AddContactsModal = ({ addModalRef, fetchContacts, isAddModalVisible, setAddModalVisible, staticUserId, setContacts, contacts }) => {
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [clearInput, setClearInput] = useState(false);

    useEffect(() => {
        if (userName) {
            getUsers();
        }
    }, [userName]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (addModalRef.current && !addModalRef.current.contains(event.target)) {
                setAddModalVisible(false);
                setUserName('');
                setUserId('');
                setClearInput(true);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [addModalRef, setAddModalVisible]);

    async function getUsers() {
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/users/users?name=${userName}`);
            setUsers(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleAddContact = async () => {
        try {
            const body = {
                user1Id: staticUserId,
                user2Id: userId
            };
            const response = await axios.post('http://localhost:8080/api/v1/contacts/createContact', body);
            if (response.status === 201) {
            fetchContacts(); 
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = () => {
        handleAddContact();
        setUserName('');
        setUserId('');
        setClearInput(true);
        setAddModalVisible(false);
    };

    const handleClose = () => {
        setUserName('');
        setUserId('');
        setClearInput(true);
        setAddModalVisible(false);
    }


    return (
        <div ref={addModalRef} className={`contacts-modal ${isAddModalVisible ? 'visible' : ''}`}>
            <div className='modal-body'>
            <h4>Find user</h4>
            <div className='input-box'>
            <CustomAutocomplete
                options={users}
                onInputChange={(event, newInputValue) => {
                    setUserName(newInputValue);
                }}
                onChange={(event, newValue) => {
                    setUserName(newValue ? newValue.username : '');
                    setUserId(newValue ? newValue._id : '');
                }}
                clearInput={clearInput}
                setClearInput={setClearInput}
            />
            </div>
            <div className='modal-button-box'>
                <button onClick={handleClose}>Close</button>
                <button onClick={handleSave}>Save</button>
            </div>
            </div>
        </div>
    )
}

export default AddContactsModal