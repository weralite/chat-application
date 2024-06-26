import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomAutocomplete from '../autoComplete/autoComplete';
import '../../styles/modal.style.css';


const AddContactsModal = ({ addModalRef, fetchContacts, isAddModalVisible, setAddModalVisible, staticUserId, setContacts, contacts }) => {
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [clearInput, setClearInput] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');


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
                return response.status;
            }
        } catch (error) {
            console.error(error.response.data.message);
            setErrorMessage(error.response.data.message);
            return error.response.status;
        }
    };

    const handleSave = async () => {
        if (!userName || !userId) {
            setErrorMessage('Valid user required.');
            return;
        }

        const status = await handleAddContact();
        if (status === 201) {
            setUserName('');
            setUserId('');
            setErrorMessage('');
            setClearInput(true);
            setAddModalVisible(false);
        }
    };

    const handleClose = () => {
        setUserName('');
        setUserId('');
        setErrorMessage('');
        setClearInput(true);
        setAddModalVisible(false);
    }


    return (
        <div ref={addModalRef} className={`contacts-modal ${isAddModalVisible ? 'visible' : ''}`}>
            <div className='modal-body'>
                <h4>Find user</h4>
                <div className='input-box'>
                    <CustomAutocomplete
                        setErrorMessage={setErrorMessage}
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
                <p className={`error-message ${errorMessage ? 'visible' : 'invisible'}`}>
                    {errorMessage || ' '}
                </p>
                <div className='modal-button-box'>
                    <button onClick={handleClose}>Close</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    )
}

export default AddContactsModal