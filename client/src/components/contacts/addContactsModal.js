import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomAutocomplete from '../autoComplete/autoComplete';


const ContactsModal = ({ addModalRef, isAddModalVisible, setAddModalVisible, staticUserId }) => {
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [clearInput, setClearInput] = useState(false);

    useEffect(() => {
        if (userName) {
            getUsers();
        }
    }, [userName]);

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
            <h4>Find user</h4>
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
            <div>
            <button onClick={handleClose}>Close</button>
            <button onClick={handleSave}>Save</button>
            </div>
        </div>
    )
}

export default ContactsModal